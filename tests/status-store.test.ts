import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** The store resolves DATA_DIR at module load, so each test gets a fresh one. */
async function loadStore(dir: string) {
  process.env.DATA_DIR = dir;
  vi.resetModules();
  return import('@/lib/status/store');
}

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'csupor-status-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('status store', () => {
  it('claims nothing before the brewery has set anything', async () => {
    const store = await loadStore(dir);
    const status = await store.readStatus();

    // `hidden` is what keeps an unverified "we are open" off the home page.
    expect(status.mode).toBe('hidden');
    expect(status.note).toBe('');
  });

  it('round-trips an open state with a note', async () => {
    const store = await loadStore(dir);
    await store.writeStatus({ mode: 'open', note: 'Ma 23:00-ig csapolunk' });

    const reloaded = await loadStore(dir);
    const status = await reloaded.readStatus();
    expect(status.mode).toBe('open');
    expect(status.note).toBe('Ma 23:00-ig csapolunk');
  });

  it('keeps the reason when closed', async () => {
    const store = await loadStore(dir);
    const saved = await store.writeStatus({
      mode: 'closed',
      note: 'A Főzdefeszten vagyunk Egerben',
    });

    expect(saved.mode).toBe('closed');
    expect(saved.note).toBe('A Főzdefeszten vagyunk Egerben');
  });

  it('drops the note when the card is hidden', async () => {
    const store = await loadStore(dir);
    // A festival message must not survive to reappear months later.
    const saved = await store.writeStatus({ mode: 'hidden', note: 'Fesztiválon vagyunk' });

    expect(saved.note).toBe('');
    expect((await store.readStatus()).note).toBe('');
  });

  it('stamps updatedAt so the admin can see staleness', async () => {
    const store = await loadStore(dir);
    const before = Date.now();
    const saved = await store.writeStatus({ mode: 'open', note: '' });

    expect(new Date(saved.updatedAt).getTime()).toBeGreaterThanOrEqual(before - 1000);
  });

  it('hides the card rather than crashing on a corrupt file', async () => {
    await writeFile(join(dir, 'status.json'), '{ not json at all', 'utf8');
    const store = await loadStore(dir);

    // The hero renders this; a bad read must never take the home page down.
    expect((await store.readStatus()).mode).toBe('hidden');
  });

  it('hides the card when the stored shape is invalid', async () => {
    await writeFile(join(dir, 'status.json'), JSON.stringify({ mode: 'party' }), 'utf8');
    const store = await loadStore(dir);

    expect((await store.readStatus()).mode).toBe('hidden');
  });

  it('writes valid JSON', async () => {
    const store = await loadStore(dir);
    await store.writeStatus({ mode: 'closed', note: 'Privát rendezvény' });

    const raw = await readFile(join(dir, 'status.json'), 'utf8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});
