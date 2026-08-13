import 'server-only';

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { beerListSchema, SEED_BEERS, type Beer, type BeerInput } from './schema';

/**
 * A JSON file on a mounted volume, not a database.
 *
 * This list holds fewer than twenty rows and is edited a handful of times a
 * week by one person. Postgres would be more infrastructure than the whole
 * rest of the site (CEF Principle 5 and 18). Writes are atomic — a temp file
 * plus rename — so a crash mid-write cannot leave a truncated list.
 */

const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'beers.json');

/** Serialises writes so two concurrent admin saves cannot interleave. */
let writeQueue: Promise<unknown> = Promise.resolve();

async function readRaw(): Promise<Beer[] | null> {
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = beerListSchema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      console.error(
        '[beers] stored data failed validation, falling back to seed',
        parsed.error.issues,
      );
      return null;
    }
    return parsed.data;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') {
      console.error('[beers] could not read store', error);
    }
    return null;
  }
}

/**
 * Writes the list, renumbering `order` from the array's position.
 *
 * It deliberately does NOT sort first: callers hand over the array in the
 * order they want published, and a reorder changes positions without touching
 * the old `order` values. Sorting here would re-apply the previous ordering
 * and silently undo every move.
 */
async function persist(beers: Beer[]): Promise<void> {
  const ordered = beers.map((beer, index) => ({ ...beer, order: index }));

  await mkdir(dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(ordered, null, 2) + '\n', 'utf8');
  await rename(tmp, DATA_FILE);
}

/** Runs a read-modify-write cycle with the queue held. */
function mutate<T>(fn: (beers: Beer[]) => Promise<T> | T): Promise<T> {
  const next = writeQueue.then(async () => {
    // Hand `fn` a list already in published order, so it can reason about
    // positions directly.
    const beers = ((await readRaw()) ?? [...SEED_BEERS]).slice().sort((a, b) => a.order - b.order);
    return fn(beers);
  });
  // Keep the chain alive even if this mutation rejects.
  writeQueue = next.catch(() => undefined);
  return next;
}

/**
 * Every beer, ordered. Falls back to the seed when the volume is empty — which
 * is the case on a first boot and during the Docker image build.
 */
export async function listBeers(): Promise<Beer[]> {
  const stored = await readRaw();
  const beers = stored ?? [...SEED_BEERS];
  return [...beers].sort((a, b) => a.order - b.order);
}

/** Only what is currently on tap — what the public beers page shows. */
export async function listBeersOnTap(): Promise<Beer[]> {
  return (await listBeers()).filter((beer) => beer.onTap);
}

export async function getBeer(id: string): Promise<Beer | null> {
  return (await listBeers()).find((beer) => beer.id === id) ?? null;
}

export async function createBeer(input: BeerInput): Promise<Beer> {
  return mutate(async (beers) => {
    const beer: Beer = {
      ...input,
      id: slugId(input.name, beers),
      order: beers.length,
    };
    await persist([...beers, beer]);
    return beer;
  });
}

export async function updateBeer(id: string, input: BeerInput): Promise<Beer | null> {
  return mutate(async (beers) => {
    const index = beers.findIndex((beer) => beer.id === id);
    const existing = beers[index];
    if (!existing) return null;
    const updated: Beer = { ...existing, ...input };
    const next = [...beers];
    next[index] = updated;
    await persist(next);
    return updated;
  });
}

export async function deleteBeer(id: string): Promise<boolean> {
  return mutate(async (beers) => {
    const next = beers.filter((beer) => beer.id !== id);
    if (next.length === beers.length) return false;
    await persist(next);
    return true;
  });
}

/** Moves a beer one slot up or down in the published order. */
export async function moveBeer(id: string, direction: 'up' | 'down'): Promise<boolean> {
  return mutate(async (beers) => {
    const sorted = [...beers];
    const index = sorted.findIndex((beer) => beer.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;

    const current = sorted[index];
    const neighbour = sorted[target];
    if (!current || !neighbour) return false;

    sorted[index] = neighbour;
    sorted[target] = current;
    await persist(sorted);
    return true;
  });
}

/** URL-safe, collision-free id derived from the name. */
function slugId(name: string, existing: readonly Beer[]): string {
  const base =
    name
      .normalize('NFD')
      // strip combining diacritics so "Tántorgó" becomes "tantorgo"
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'sor';

  if (!existing.some((beer) => beer.id === base)) return base;
  let n = 2;
  while (existing.some((beer) => beer.id === `${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
