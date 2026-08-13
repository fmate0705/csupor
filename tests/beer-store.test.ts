import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The store resolves DATA_DIR at module load, so each test needs a fresh temp
 * directory and a fresh module instance.
 */
async function loadStore(dir: string) {
  process.env.DATA_DIR = dir;
  vi.resetModules();
  return import('@/lib/beers/store');
}

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'csupor-beers-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('beer store', () => {
  it('serves the seed list when the volume is empty', async () => {
    const store = await loadStore(dir);
    const beers = await store.listBeers();

    expect(beers.length).toBeGreaterThan(0);
    // Ordering is what the public page relies on.
    expect(beers.map((b) => b.order)).toEqual([...beers.map((_, i) => i)]);
  });

  it('adds a beer and makes it visible on tap', async () => {
    const store = await loadStore(dir);
    const before = (await store.listBeersOnTap()).length;

    const created = await store.createBeer({
      name: 'Próba Sör',
      style: 'Teszt IPA',
      abv: 5.5,
      notes: 'Csak teszt.',
      onTap: true,
      seasonal: false,
    });

    expect(created.id).toBe('proba-sor');
    const onTap = await store.listBeersOnTap();
    expect(onTap).toHaveLength(before + 1);
    expect(onTap.map((b) => b.name)).toContain('Próba Sör');
  });

  it('hides a beer from the public list when it is taken off tap', async () => {
    const store = await loadStore(dir);
    const [first] = await store.listBeers();
    if (!first) throw new Error('seed list was empty');

    await store.updateBeer(first.id, {
      name: first.name,
      style: first.style,
      abv: first.abv,
      notes: first.notes,
      onTap: false,
      seasonal: first.seasonal,
    });

    const onTap = await store.listBeersOnTap();
    expect(onTap.map((b) => b.id)).not.toContain(first.id);
    // Still present in the full list, so the admin can put it back.
    expect((await store.listBeers()).map((b) => b.id)).toContain(first.id);
  });

  it('deletes a beer and keeps the remaining order contiguous', async () => {
    const store = await loadStore(dir);
    const beers = await store.listBeers();
    const victim = beers[2];
    if (!victim) throw new Error('seed list too short');

    expect(await store.deleteBeer(victim.id)).toBe(true);

    const after = await store.listBeers();
    expect(after.map((b) => b.id)).not.toContain(victim.id);
    expect(after.map((b) => b.order)).toEqual(after.map((_, i) => i));
  });

  it('reorders and refuses to move past the ends', async () => {
    const store = await loadStore(dir);
    const before = await store.listBeers();
    const second = before[1];
    if (!second) throw new Error('seed list too short');

    expect(await store.moveBeer(second.id, 'up')).toBe(true);
    expect((await store.listBeers())[0]?.id).toBe(second.id);

    // Now at the top — moving up again must be a no-op, not a crash.
    expect(await store.moveBeer(second.id, 'up')).toBe(false);
  });

  it('gives colliding names distinct ids', async () => {
    const store = await loadStore(dir);
    const input = {
      style: 'APA',
      abv: 5,
      notes: '',
      onTap: true,
      seasonal: false,
    };

    const a = await store.createBeer({ ...input, name: 'Azonos Név' });
    const b = await store.createBeer({ ...input, name: 'Azonos Név' });

    expect(a.id).toBe('azonos-nev');
    expect(b.id).toBe('azonos-nev-2');
  });

  it('falls back to the seed rather than crashing on a corrupt file', async () => {
    await writeFile(join(dir, 'beers.json'), '{ this is not json', 'utf8');
    const store = await loadStore(dir);

    const beers = await store.listBeers();
    expect(beers.length).toBeGreaterThan(0);
  });

  it('writes valid JSON that survives a reload', async () => {
    const store = await loadStore(dir);
    await store.createBeer({
      name: 'Perzisztens',
      style: 'Lager',
      abv: null,
      notes: '',
      onTap: true,
      seasonal: false,
    });

    const raw = await readFile(join(dir, 'beers.json'), 'utf8');
    expect(() => JSON.parse(raw)).not.toThrow();

    const reloaded = await loadStore(dir);
    expect((await reloaded.listBeers()).map((b) => b.name)).toContain('Perzisztens');
  });
});
