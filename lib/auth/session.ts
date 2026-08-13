import { jwtVerify, SignJWT } from 'jose';

/**
 * Session handling for the single-operator admin panel.
 *
 * `jose` rather than `jsonwebtoken` because this runs in Next.js middleware on
 * the Edge runtime, where Node crypto APIs are unavailable. It is also ~10x
 * smaller and has no dependencies.
 *
 * This module is imported by middleware, so it must stay Edge-safe: no
 * `node:` imports, no `server-only`.
 */

export const SESSION_COOKIE = 'csupor_session';
const ISSUER = 'csupor-craft-beer';
const AUDIENCE = 'csupor-admin';

/** Eight hours: long enough for a shift, short enough to matter if leaked. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export interface SessionPayload {
  /** The admin username that authenticated. */
  sub: string;
}

let cachedKey: Uint8Array | null = null;

/**
 * The signing key. Throws rather than falling back to a default — a predictable
 * secret would make the admin panel trivially forgeable, so refusing to boot is
 * the correct failure mode (CEF security: secrets are never defaulted).
 */
function secretKey(): Uint8Array {
  if (cachedKey) return cachedKey;

  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET is missing or shorter than 32 characters. Generate one with `openssl rand -base64 32` and set it in .env.',
    );
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(username)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Returns the payload for a valid token, or null for anything else. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
    });
    return typeof payload.sub === 'string' ? { sub: payload.sub } : null;
  } catch {
    // Expired, tampered, or signed with a rotated secret — all mean "no session".
    return null;
  }
}

/** Cookie options shared by the login and logout paths so they cannot drift. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    // Secure in production only, so the panel still works over http://localhost.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}
