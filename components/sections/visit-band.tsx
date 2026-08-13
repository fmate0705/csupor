import { ArrowRight, MapPin, Phone } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { LocationMap } from '@/components/site/location-map';
import { OpeningHours } from '@/components/site/opening-hours';
import { business } from '@/content/business';

/**
 * The closing call to visit, shared by the home and brewery pages.
 *
 * One component rather than two near-identical blocks (CEF Principle 8), so the
 * address, phone and hours can only ever say one thing.
 *
 * The `compact` variant drops the opening-hours block — it is used on pages that
 * already carry the practical detail elsewhere.
 *
 * The layout deliberately mirrors the terrace band on the home page: the same
 * 1440px container with the same gutters, the same asymmetric two-column grid,
 * and a 16:10 frame for the visual. The map therefore sits inside the page
 * rather than bleeding to the viewport edge, and matches the size of the
 * terrace photograph it sits below.
 */
export function VisitBand({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  return (
    <section className="on-dark bg-background py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <LocationMap className="aspect-[16/10]" />
          </Reveal>

          <Reveal delay={80} className="w-full">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold" />
              Gyere el
            </p>
            <h2 className="mt-5 font-display text-[clamp(1.75rem,3.4vw,2.75rem)]">
              A legjobb sör az,
              <br />
              amiért eljössz
            </h2>
            <p className="mt-5 max-w-[46ch] text-muted">
              A taproom a főzde épületében van, a terasz pedig a régi kútbeálló alatt. Kutyát
              hozhatsz, asztalt foglalni nem kell.
            </p>

            <dl className="mt-9 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="eyebrow flex items-center gap-2">
                  <MapPin aria-hidden className="h-3.5 w-3.5 text-gold" />
                  Cím
                </dt>
                <dd className="mt-1">
                  <a
                    href={business.maps.placeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center underline-offset-4 transition-colors duration-fast hover:text-gold hover:underline"
                  >
                    {business.address.full}
                  </a>
                  <span className="mt-1 block text-sm text-muted">{business.address.landmark}</span>
                </dd>
              </div>
              <div>
                <dt className="eyebrow flex items-center gap-2">
                  <Phone aria-hidden className="h-3.5 w-3.5 text-gold" />
                  Telefon
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${business.phone.e164}`}
                    className="inline-flex min-h-[44px] items-center underline-offset-4 transition-colors duration-fast hover:text-gold hover:underline"
                  >
                    {business.phone.display}
                  </a>
                </dd>
              </div>
            </dl>

            {variant === 'full' ? (
              <div className="mt-6 border-t border-border pt-6">
                <p className="eyebrow">{business.hoursFallback.label}</p>
                <div className="mt-2 text-sm text-muted">
                  <OpeningHours variant="compact" />
                </div>
              </div>
            ) : null}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={business.maps.directionsUrl} variant="gold" size="lg" external>
                Útvonaltervezés
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-normal ease-standard group-hover:translate-x-1"
                />
              </ButtonLink>
              <ButtonLink href="/latogatas" variant="outline" size="lg">
                Minden tudnivaló
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

