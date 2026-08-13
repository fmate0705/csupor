/**
 * Asset pipeline — turns `assets/source/*.webp` into the images the site ships.
 *
 * Why this exists: the supplied photography is small (680px on the long edge at
 * most) and one file is a three-up contact sheet rather than a usable frame.
 * Rather than upscaling everything and shipping mush, this script:
 *
 *   1. splits the contact sheet into its three real photographs,
 *   2. applies a conservative 2x lanczos upscale + unsharp mask ONLY to the
 *      images used at large sizes, so the browser is never left to do it,
 *   3. emits AVIF + WebP at the sizes the layouts actually request,
 *   4. builds the OG card and the favicon set from the real logo.
 *
 * Re-run with `pnpm assets` after replacing anything in assets/source.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const SRC = 'assets/source';
const OUT = 'public/images';

/** Brand ink and gold — kept in sync with app/theme.css. */
const INK = '#0E0E0D';
const GOLD = '#E69137';

/**
 * The contact sheet is one file containing three separate photographs.
 * These crops were measured off the source; they exclude the white gutters.
 */
const CONTACT_SHEET = {
  file: 'helyszin.webp',
  frames: [
    { name: 'sorfozde-alkonyat', left: 0, top: 0, width: 385, height: 453 },
    { name: 'tartaly-kulteri', left: 393, top: 0, width: 287, height: 224 },
    { name: 'sorfozde-viragok', left: 393, top: 228, width: 287, height: 225 },
  ],
};

/**
 * Each entry: which source, how wide it is ever rendered, and whether it earns
 * the upscale. `maxRender` is the largest CSS width the layout gives it; we
 * target 2x that, capped at 2x the source so we never invent detail wholesale.
 */
const IMAGES = [
  { src: 'hero.webp', name: 'hero-terasz-sor', maxRender: 1600, upscale: true },
  { src: 'helyszin2.webp', name: 'terasz-esti', maxRender: 1200, upscale: true },
  { src: 'helyszin3.webp', name: 'terasz-nappali', maxRender: 900, upscale: true },
  { src: 'folyamat2.webp', name: 'sorfozes-kozben', maxRender: 720, upscale: true },
  { src: 'folyamat.webp', name: 'sorfozes-tartaly', maxRender: 560, upscale: false },
  { src: 'latvany1.webp', name: 'pohar-a-fozdeben', maxRender: 720, upscale: true },
  { src: 'latvany2.webp', name: 'fozde-berendezes', maxRender: 560, upscale: false },
  { src: 'csapat.webp', name: 'csapat', maxRender: 1200, upscale: true },
];

const WIDTHS = [480, 768, 1024, 1440, 1920];

async function emit(input, name, maxRender, upscale) {
  const meta = await sharp(input).metadata();
  const ceiling = upscale ? meta.width * 2 : meta.width;
  const target = Math.min(maxRender * 2, ceiling);

  let base = sharp(input);
  if (target > meta.width) {
    base = base.resize({ width: Math.round(target), kernel: 'lanczos3' }).sharpen({
      sigma: 0.7,
      m1: 0.4,
      m2: 0.6,
    });
  }
  const master = await base.toBuffer();
  const masterMeta = await sharp(master).metadata();

  const widths = WIDTHS.filter((w) => w <= masterMeta.width);
  if (widths.at(-1) !== masterMeta.width) widths.push(masterMeta.width);

  for (const w of widths) {
    const resized = sharp(master).resize({ width: w, kernel: 'lanczos3' });
    await resized.clone().avif({ quality: 62, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await resized.clone().webp({ quality: 80, effort: 6 }).toFile(`${OUT}/${name}-${w}.webp`);
  }

  // A tiny blurred placeholder, inlined as the blurDataURL so there is no CLS
  // and no extra request.
  const blur = await sharp(master).resize({ width: 16 }).blur(1.2).webp({ quality: 40 }).toBuffer();

  // `name` is the manifest key, so it is deliberately not repeated in the value.
  return {
    width: masterMeta.width,
    height: masterMeta.height,
    widths,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
  };
}

/** Escapes text for safe inclusion in the SVG scrim. */
function xml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest = {};

  // 1. Split the contact sheet into real frames first.
  const sheet = `${SRC}/${CONTACT_SHEET.file}`;
  await mkdir('assets/derived', { recursive: true });
  const derived = [];
  for (const f of CONTACT_SHEET.frames) {
    const path = `assets/derived/${f.name}.webp`;
    await sharp(sheet)
      .extract({ left: f.left, top: f.top, width: f.width, height: f.height })
      .webp({ quality: 95 })
      .toFile(path);
    derived.push({ path, name: f.name });
  }

  // 2. Emit every image the site uses.
  for (const img of IMAGES) {
    manifest[img.name] = await emit(`${SRC}/${img.src}`, img.name, img.maxRender, img.upscale);
    console.log(`  ${img.name.padEnd(20)} ${manifest[img.name].width}px master`);
  }
  const derivedRender = {
    'sorfozde-alkonyat': 900,
    'tartaly-kulteri': 560,
    'sorfozde-viragok': 560,
  };
  for (const d of derived) {
    manifest[d.name] = await emit(d.path, d.name, derivedRender[d.name], true);
    console.log(`  ${d.name.padEnd(20)} ${manifest[d.name].width}px master (from contact sheet)`);
  }

  // 3. Logo: ship the white lockup as-is, plus an ink version for light surfaces.
  await sharp(`${SRC}/logo.webp`).png().toFile('public/logo-white.png');
  await sharp(`${SRC}/logo.webp`)
    .ensureAlpha()
    .negate({ alpha: false })
    .png()
    .toFile('public/logo-ink.png');

  // 4. Favicon + apple touch icon, built from the monogram half of the lockup.
  const mono = await sharp(`${SRC}/logo.webp`)
    .extract({ left: 0, top: 0, width: 204, height: 204 })
    .toBuffer();
  for (const size of [32, 180, 192, 512]) {
    const pad = Math.round(size * 0.18);
    const mark = await sharp(mono)
      .resize({
        width: size - pad * 2,
        height: size - pad * 2,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const buf = await sharp({
      create: { width: size, height: size, channels: 4, background: INK },
    })
      .composite([{ input: mark, top: pad, left: pad }])
      .png()
      .toBuffer();
    const file =
      size === 32
        ? 'public/favicon.png'
        : size === 180
          ? 'public/apple-touch-icon.png'
          : `public/icon-${size}.png`;
    await writeFile(file, buf);
  }

  // 5. Open Graph card: the hero photograph, darkened, with the logo over it.
  const ogBase = await sharp(`${SRC}/hero.webp`)
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7 })
    .toBuffer();

  const headline = 'Kézműves sörfőzde Hatvanban';
  const subline = 'Sörfőzde, taproom és terasz — 2014 óta';
  const scrim = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
       <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
         <stop offset="0%" stop-color="${INK}" stop-opacity="0.94"/>
         <stop offset="55%" stop-color="${INK}" stop-opacity="0.55"/>
         <stop offset="100%" stop-color="${INK}" stop-opacity="0.25"/>
       </linearGradient></defs>
       <rect width="1200" height="630" fill="url(#g)"/>
       <rect x="72" y="446" width="64" height="4" fill="${GOLD}"/>
       <text x="72" y="524" font-family="Archivo Black, Arial Black, sans-serif" font-size="52"
             fill="#F5F3EF" letter-spacing="-1">${xml(headline)}</text>
       <text x="72" y="566" font-family="Inter, Arial, sans-serif" font-size="26" fill="#C9C4BA">
         ${xml(subline)}
       </text>
     </svg>`,
    'utf8',
  );
  const logoForOg = await sharp(`${SRC}/logo.webp`).resize({ width: 320 }).toBuffer();
  await sharp(ogBase)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: logoForOg, top: 64, left: 72 },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile('public/og.jpg');

  // 6. Emit the manifest as a TypeScript module rather than JSON: it gives
  // Photo a literal type for the image names (so a typo is a compile error,
  // not a runtime crash) and avoids depending on resolveJsonModule.
  const manifestModule = `/**
 * GENERATED FILE — do not edit.
 * Written by scripts/build-assets.mjs. Run \`pnpm assets\` to regenerate.
 *
 * Describes every image in public/images: the master dimensions, which widths
 * were emitted, and an inline blurred placeholder.
 */
export interface ImageEntry {
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
  readonly blurDataURL: string;
}

export const imageManifest = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<string, ImageEntry>;

export type PhotoName = keyof typeof imageManifest;
`;
  await writeFile('lib/image-manifest.ts', manifestModule, 'utf8');
  console.log(`\nWrote ${Object.keys(manifest).length} image sets + logo, icons and OG card.`);
}

await main();
