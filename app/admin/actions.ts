'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { verifyCredentials } from '@/lib/auth/credentials';
import { checkLoginRate, clearLoginRate } from '@/lib/auth/rate-limit';
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
  verifySessionToken,
} from '@/lib/auth/session';
import { beerInputSchema } from '@/lib/beers/schema';
import { createBeer, deleteBeer, moveBeer, updateBeer } from '@/lib/beers/store';
import { statusInputSchema } from '@/lib/status/schema';
import { writeStatus } from '@/lib/status/store';

/**
 * Server Actions for the admin panel.
 *
 * Every mutating action calls `requireSession()` first. Middleware already
 * blocks unauthenticated navigation to /admin, but Server Actions are POST
 * endpoints that can be invoked directly — so the session is re-checked here.
 * Middleware is a convenience; this is the authorisation boundary.
 */

export interface ActionState {
  error?: string;
  success?: string;
}

async function requireSession(): Promise<void> {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) redirect('/admin/belepes');
}

/** Republishes the surfaces that render the open/closed card. */
function revalidateStatusSurfaces(): void {
  // The hero is on the home page only; /admin re-reads it to show the form.
  revalidatePath('/');
  revalidatePath('/admin');
}

/** Republishes every surface that renders the beer list. */
function revalidateBeerSurfaces(): void {
  revalidatePath('/');
  revalidatePath('/sorok');
  revalidatePath('/admin');
}

// ---------------------------------------------------------------- auth

const loginSchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(200),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: 'Add meg a felhasználónevet és a jelszót.' };
  }

  // Rate-limit per client IP behind the reverse proxy, falling back to a shared
  // bucket when no forwarded header is present.
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rate = checkLoginRate(ip);
  if (!rate.allowed) {
    return {
      error: `Túl sok sikertelen próbálkozás. Próbáld újra ${rate.retryAfterMinutes} perc múlva.`,
    };
  }

  let ok = false;
  try {
    ok = verifyCredentials(parsed.data.username, parsed.data.password);
  } catch (error) {
    // Misconfiguration, not a bad password — say so instead of "wrong password".
    console.error('[auth] credential check failed', error);
    return { error: 'A bejelentkezés nincs beállítva a szerveren. Ellenőrizd a .env fájlt.' };
  }

  if (!ok) {
    // Deliberately does not say which field was wrong.
    return { error: 'Hibás felhasználónév vagy jelszó.' };
  }

  clearLoginRate(ip);
  const token = await createSessionToken(parsed.data.username);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE_SECONDS));

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', sessionCookieOptions(0));
  redirect('/admin/belepes');
}

// ---------------------------------------------------------------- beers

/** Parses the shared beer form. `abv` is optional: blank means "not measured". */
function parseBeerForm(formData: FormData) {
  const rawAbv = String(formData.get('abv') ?? '').trim();
  return beerInputSchema.safeParse({
    name: formData.get('name'),
    style: formData.get('style'),
    abv: rawAbv === '' ? null : Number(rawAbv.replace(',', '.')),
    notes: String(formData.get('notes') ?? ''),
    onTap: formData.get('onTap') === 'on',
    seasonal: formData.get('seasonal') === 'on',
  });
}

export async function createBeerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = parseBeerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Érvénytelen adat.' };
  }

  try {
    await createBeer(parsed.data);
  } catch (error) {
    console.error('[beers] create failed', error);
    return { error: 'Nem sikerült menteni. Ellenőrizd, hogy a szerver írhatja az adatmappát.' };
  }

  revalidateBeerSurfaces();
  return { success: `„${parsed.data.name}” hozzáadva.` };
}

export async function updateBeerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Hiányzó azonosító.' };

  const parsed = parseBeerForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Érvénytelen adat.' };
  }

  try {
    const updated = await updateBeer(id, parsed.data);
    if (!updated) return { error: 'Ez a sör már nem létezik.' };
  } catch (error) {
    console.error('[beers] update failed', error);
    return { error: 'Nem sikerült menteni.' };
  }

  revalidateBeerSurfaces();
  return { success: 'Mentve.' };
}

export async function deleteBeerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Hiányzó azonosító.' };

  try {
    const removed = await deleteBeer(id);
    if (!removed) return { error: 'Ez a sör már nem létezik.' };
  } catch (error) {
    console.error('[beers] delete failed', error);
    return { error: 'Nem sikerült törölni.' };
  }

  revalidateBeerSurfaces();
  return { success: 'Törölve.' };
}

export async function moveBeerAction(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get('id') ?? '');
  const direction = formData.get('direction') === 'up' ? 'up' : 'down';
  if (!id) return;

  try {
    await moveBeer(id, direction);
    revalidateBeerSurfaces();
  } catch (error) {
    console.error('[beers] reorder failed', error);
  }
}

// ---------------------------------------------------------------- status

/**
 * Sets the open/closed card shown in the hero.
 *
 * "Nem jelenik meg" is a first-class option, not an afterthought: the site
 * publishes no opening hours, so the brewery must be able to say nothing at all
 * rather than leave a stale "Most nyitva" on the front page.
 */
export async function updateStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = statusInputSchema.safeParse({
    mode: formData.get('mode'),
    note: String(formData.get('note') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Érvénytelen állapot.' };
  }

  try {
    await writeStatus(parsed.data);
  } catch (error) {
    console.error('[status] save failed', error);
    return { error: 'Nem sikerült menteni. Ellenőrizd, hogy a szerver írhatja az adatmappát.' };
  }

  revalidateStatusSurfaces();

  const confirmation = {
    hidden: 'A kártya mostantól nem jelenik meg az oldalon.',
    open: 'Mentve — a kezdőlapon „Most nyitva” látszik.',
    closed: 'Mentve — a kezdőlapon „Most zárva” látszik.',
  } as const;

  return { success: confirmation[parsed.data.mode] };
}
