import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Credential checking for the single admin account configured in `.env`.
 *
 * Both values are hashed to a fixed 32-byte digest before comparison. That
 * gives `timingSafeEqual` equal-length inputs (it throws otherwise) and means
 * the comparison time leaks neither the password nor its length.
 */

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export interface AdminCredentials {
  username: string;
  password: string;
}

/** Reads and validates the configured admin credentials. */
export function adminCredentials(): AdminCredentials {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }
  return { username, password };
}

/**
 * True only when both fields match. Always compares both, so a wrong username
 * takes the same time as a wrong password and cannot be enumerated.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const expected = adminCredentials();
  const userOk = safeEqual(username, expected.username);
  const passOk = safeEqual(password, expected.password);
  return userOk && passOk;
}
