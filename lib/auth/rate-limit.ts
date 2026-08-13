import 'server-only';

/**
 * A small in-memory limiter for the login form.
 *
 * Scope: one container, one operator. A shared store (Redis) would be the right
 * answer for a multi-instance deployment, but this site runs as a single
 * container, so an in-process map is sufficient and adds no infrastructure.
 * If this is ever scaled horizontally, replace this module — the interface is
 * deliberately tiny.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drops expired buckets so the map cannot grow without bound. */
function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Whole minutes until the caller may try again. */
  retryAfterMinutes: number;
}

export function checkLoginRate(key: string): RateLimitResult {
  const now = Date.now();
  if (buckets.size > 512) sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMinutes: 0 };
  }

  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterMinutes: Math.max(1, Math.ceil((bucket.resetAt - now) / 60_000)),
    };
  }
  return { allowed: true, retryAfterMinutes: 0 };
}

/** Called after a successful login so a good password clears the counter. */
export function clearLoginRate(key: string): void {
  buckets.delete(key);
}
