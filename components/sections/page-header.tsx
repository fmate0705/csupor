import { Photo, type PhotoName } from '@/components/ui/photo';

/**
 * The dark masthead every non-home page opens with.
 *
 * Its second job is structural: because each page starts dark, the fixed
 * header can stay transparent over it and the white logo is always legible.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  photo,
  photoAlt,
  focus,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  photo: PhotoName;
  photoAlt: string;
  focus?: string;
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-background pb-16 pt-32 sm:pb-20 sm:pt-40 lg:pb-24 lg:pt-44">
      <div className="grain absolute inset-0 -z-10">
        <Photo
          name={photo}
          alt={photoAlt}
          sizes="100vw"
          priority
          aspect="auto"
          focus={focus}
          className="h-full w-full bg-background"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(14_14_13/0.95)_0%,rgb(14_14_13/0.82)_45%,rgb(14_14_13/0.62)_100%)]"
        />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-gold" />
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(1.875rem,7.5vw,4.5rem)] leading-[0.96] tracking-[-0.03em]">
          {title}
        </h1>
        {lead ? <p className="mt-6 max-w-[52ch] text-lg text-foreground/90">{lead}</p> : null}
      </div>
    </section>
  );
}
