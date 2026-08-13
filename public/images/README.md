# Images

Everything in this folder is **generated** by `pnpm assets`
(`scripts/build-assets.mjs`) from the brewery's own photographs in
`assets/source/`. Do not edit these files by hand — the next run overwrites them.

No AI-generated imagery is used anywhere on this site. The brief allowed one or
two decorative background renders; none were needed, because the supplied
photography carries the design.

## What the pipeline produces

For each photograph, an AVIF and a WebP at every width the layouts request
(`<name>-<width>.avif` / `.webp`), plus an entry in `lib/image-manifest.ts`
holding the master dimensions and an inlined blurred placeholder.

The source photographs are small — 680px on the long edge at most — so images
used at large sizes get a conservative 2x lanczos upscale with an unsharp mask
rather than being left to the browser. Nothing is upscaled beyond 2x.

`helyszin.webp` is a three-up contact sheet rather than a single frame; the
pipeline splits it into `sorfozde-alkonyat`, `tartaly-kulteri` and
`sorfozde-viragok` before processing.

## Replacing a photograph

1. Drop the new file into `assets/source/`.
2. If the filename changed, update the `IMAGES` list in
   `scripts/build-assets.mjs`.
3. Run `pnpm assets`.
4. Commit the regenerated files — the Docker build does not run this step, so
   `public/images/` and `lib/image-manifest.ts` must be in the repository.

Higher-resolution originals would be worth requesting from the brewery: at
1600px+ the hero could drop the upscale entirely.
