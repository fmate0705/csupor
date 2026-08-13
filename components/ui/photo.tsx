import { imageManifest, type PhotoName } from '@/lib/image-manifest';
import { cn } from '@/lib/cn';

export type { PhotoName };

/**
 * Renders one of the pre-built photographs from `public/images`.
 *
 * These images are generated ahead of time by `pnpm assets`, which already
 * emits AVIF + WebP at the widths the layouts ask for. So this is a plain
 * `<picture>` rather than next/image: there is nothing left to optimise at
 * runtime, and it keeps sharp off the critical path in production.
 *
 * The blurred 16px preview is inlined as a background on the frame, so there
 * is no second request and no layout shift while the photo decodes.
 */

interface PhotoProps {
  name: PhotoName;
  /** Describe what is in the shot. Empty string only for purely decorative use. */
  alt: string;
  /** The `sizes` attribute — must reflect how wide the image really renders. */
  sizes: string;
  /** CSS aspect-ratio for the frame, e.g. '4 / 5'. Defaults to the source ratio. */
  aspect?: string;
  /** object-position, for steering the crop. */
  focus?: string;
  /** Set on the LCP image only. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

function srcSet(name: string, widths: readonly number[], ext: 'avif' | 'webp'): string {
  return widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(', ');
}

export function Photo({
  name,
  alt,
  sizes,
  aspect,
  focus,
  priority = false,
  className,
  imgClassName,
}: PhotoProps) {
  const image = imageManifest[name];
  const widest = image.widths[image.widths.length - 1];

  return (
    <div
      // `w-full` and `min-w-0` matter: with an aspect-ratio set but an
      // indefinite width, a grid/flex item's `min-width: auto` resolves against
      // the ratio and blows the track out past the viewport. Making the width
      // definite keeps the ratio driving the height, not the width.
      className={cn('relative w-full min-w-0 overflow-hidden bg-surface', className)}
      style={{
        aspectRatio: aspect ?? `${image.width} / ${image.height}`,
        backgroundImage: `url("${image.blurDataURL}")`,
        backgroundSize: 'cover',
        backgroundPosition: focus ?? 'center',
      }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(name, image.widths, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(name, image.widths, 'webp')} sizes={sizes} />
        <img
          src={`/images/${name}-${widest}.webp`}
          alt={alt}
          width={image.width}
          height={image.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
          style={{ objectPosition: focus ?? 'center' }}
        />
      </picture>
    </div>
  );
}
