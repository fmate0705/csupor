import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSessionToken, verifySessionToken } from '@/lib/auth/session';

const SECRET = 'test-secret-that-is-definitely-long-enough';

describe('session tokens', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = SECRET;
  });

  it('round-trips a valid session', async () => {
    const token = await createSessionToken('csupor');
    await expect(verifySessionToken(token)).resolves.toEqual({ sub: 'csupor' });
  });

  it('rejects a missing token', async () => {
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
  });

  it('rejects a tampered payload', async () => {
    const token = await createSessionToken('csupor');
    const [header, , signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ sub: 'attacker' })).toString('base64url');

    await expect(verifySessionToken(`${header}.${forged}.${signature}`)).resolves.toBeNull();
  });

  it('rejects a token that is not a JWT at all', async () => {
    await expect(verifySessionToken('not-a-token')).resolves.toBeNull();
  });
});

describe('credential checking', () => {
  const ORIGINAL = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  async function loadCredentials() {
    vi.resetModules();
    return import('@/lib/auth/credentials');
  }

  it('accepts the configured pair and rejects everything else', async () => {
    process.env.ADMIN_USERNAME = 'csupor';
    process.env.ADMIN_PASSWORD = 'egy-eleg-hosszu-jelszo';
    const { verifyCredentials } = await loadCredentials();

    expect(verifyCredentials('csupor', 'egy-eleg-hosszu-jelszo')).toBe(true);
    expect(verifyCredentials('csupor', 'rossz-jelszo-de-hosszu')).toBe(false);
    expect(verifyCredentials('masvalaki', 'egy-eleg-hosszu-jelszo')).toBe(false);
    // Differing lengths must not throw — timingSafeEqual needs equal buffers,
    // which is why both sides are hashed first.
    expect(verifyCredentials('x', 'y')).toBe(false);
  });

  it('refuses to run when credentials are not configured', async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    const { verifyCredentials } = await loadCredentials();

    expect(() => verifyCredentials('csupor', 'barmi')).toThrow(/ADMIN_USERNAME/);
  });

  it('refuses a password shorter than 12 characters', async () => {
    process.env.ADMIN_USERNAME = 'csupor';
    process.env.ADMIN_PASSWORD = 'rovid';
    const { verifyCredentials } = await loadCredentials();

    expect(() => verifyCredentials('csupor', 'rovid')).toThrow(/12/);
  });
});
