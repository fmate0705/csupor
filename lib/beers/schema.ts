import { z } from 'zod';

/**
 * A beer as the taproom thinks about it. Deliberately small: the admin panel is
 * used standing up, on a phone, between pours — every extra field is friction.
 */
export const beerSchema = z.object({
  id: z.string().min(1),
  /** e.g. "Thrash Lager" */
  name: z.string().trim().min(1, 'A sör nevét kötelező megadni.').max(80),
  /** e.g. "Német típusú pils" */
  style: z.string().trim().min(1, 'A stílust kötelező megadni.').max(80),
  /**
   * Alcohol by volume in percent. Nullable because a new experimental batch may
   * genuinely not have a measured figure yet — better an honest blank than a
   * made-up number.
   */
  abv: z.number().min(0).max(20).nullable(),
  /** Short tasting note. One or two sentences. */
  notes: z.string().trim().max(400).default(''),
  /** Currently on tap. The list rotates, so this is the field that moves most. */
  onTap: z.boolean().default(true),
  /** Optional flag for one-off / seasonal brews, shown as a small marker. */
  seasonal: z.boolean().default(false),
  /** Sort order, low first. */
  order: z.number().int().default(0),
});

export type Beer = z.infer<typeof beerSchema>;

/** What the admin form submits — id and order are assigned by the store. */
export const beerInputSchema = beerSchema.omit({ id: true, order: true });
export type BeerInput = z.infer<typeof beerInputSchema>;

export const beerListSchema = z.array(beerSchema);

/**
 * Seed list — the brewery's own published range, from csuporcraftbeer.com.
 *
 * Names, styles and ABV figures are taken from that source, not invented. The
 * notes are condensed from the brewery's own descriptions. The selection
 * rotates, so the owner is expected to prune this to what is actually on tap
 * via /admin; this seed exists so the page is never empty on first boot.
 */
export const SEED_BEERS: readonly Beer[] = [
  {
    id: 'tantorgo-paripa',
    name: 'Tántorgó ParIPA',
    style: 'Vörös West Coast IPA',
    abv: 6.5,
    notes: 'Mély borostyán szín, karamellás maláta alap, citrusos és fenyős komlókkal.',
    onTap: true,
    seasonal: false,
    order: 0,
  },
  {
    id: 'thrash-lager',
    name: 'Thrash Lager',
    style: 'Német típusú pils',
    abv: 4.8,
    notes: 'Világos, ropogósan tiszta világos sör. Finom keserűség, lágy malátás háttérrel.',
    onTap: true,
    seasonal: false,
    order: 1,
  },
  {
    id: 'straight-outta-kraft',
    name: 'Straight Outta Kraft',
    style: 'DDH East Coast IPA',
    abv: 6,
    notes: 'Közös főzés az Etyeki Sörmanufaktúrával. Trópusi gyümölcsök: mangó, ananász, szőlő.',
    onTap: true,
    seasonal: false,
    order: 2,
  },
  {
    id: '60-ale-2',
    name: '60 Ale 2.0',
    style: 'APA',
    abv: 5,
    notes: 'Friss, mély ízvilág Ahtanum és Columbus komlókkal.',
    onTap: true,
    seasonal: false,
    order: 3,
  },
  {
    id: '60-new-patriots-ipa',
    name: '60 New Patriots IPA',
    style: 'DDH American IPA',
    abv: 6,
    notes: 'Trópusi gyümölcsös aromák, kiegyensúlyozott keserűséggel.',
    onTap: true,
    seasonal: false,
    order: 4,
  },
  {
    id: 'hatwango',
    name: 'HatWango',
    style: 'Mangós savanyú sör',
    abv: 5,
    notes: 'Könnyű savanyú sör mangóval. A gyümölcs édessége és a savasság egyensúlyban.',
    onTap: true,
    seasonal: true,
    order: 5,
  },
  {
    id: 'cherry-sour',
    name: 'Cherry Sour',
    style: 'Savanyú meggysör',
    abv: 5,
    notes: 'Élénk, gyümölcsös meggy karakter, frissítő savassággal.',
    onTap: true,
    seasonal: true,
    order: 6,
  },
  {
    id: 'black-cherry',
    name: 'Black Cherry',
    style: 'Meggyes stout',
    abv: 6,
    notes: 'Sötét stout: csokoládé és kávé jegyek, savanykás meggyel.',
    onTap: true,
    seasonal: false,
    order: 7,
  },
  {
    id: 'saggitarius-b',
    name: 'Saggitarius B',
    style: 'Stout',
    abv: 7,
    notes: 'Édes, csokoládés stout — inkább desszert, mint sör.',
    onTap: true,
    seasonal: false,
    order: 8,
  },
];
