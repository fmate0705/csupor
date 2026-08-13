import type { Metadata } from 'next';
import { ArrowRight, Car, Clock, Dog, MapPin, Phone, Wallet } from 'lucide-react';

import { PageHeader } from '@/components/sections/page-header';
import { OpeningHours } from '@/components/site/opening-hours';
import { ButtonLink } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';
import { business } from '@/content/business';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/seo/jsonld';

const title = 'Látogatás';
const description = `Nyitvatartás, cím és útvonal a Csupor Craft Beer taproomhoz: ${business.address.full}. Kutyabarát terasz, kültéri ülőhelyek, telefon: ${business.phone.display}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/latogatas' },
  openGraph: { title: `${title} — ${business.name}`, description, url: '/latogatas' },
};

export default function VisitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageJsonLd({ path: '/latogatas', name: title, description }),
            breadcrumbJsonLd([
              { name: 'Kezdőlap', path: '/' },
              { name: title, path: '/latogatas' },
            ]),
          ]),
        }}
      />

      <PageHeader
        eyebrow="Látogatás"
        title={<>Gyere el a kútra</>}
        lead="A taproom a főzde épületében, a terasz a régi kútbeálló alatt. Asztalt foglalni nem kell."
        photo="terasz-esti"
        photoAlt="A Csupor terasz raklapasztalokkal és fényfüzérrel a kútbeálló alatt"
        focus="50% 55%"
      />

      {/* --- The practical block: everything needed to decide and arrive ---- */}
      <Section tone="paper" space="lg">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Jó tudni" title="A gyakorlati rész" />

            <div className="mt-10 divide-y divide-border border-y border-border">
              <Reveal className="flex gap-5 py-6">
                <MapPin aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold-ink" />
                <div>
                  <h3 className="eyebrow">Cím</h3>
                  <p className="mt-2 text-lg font-medium">{business.address.full}</p>
                  <p className="mt-1 text-muted">Keresd {business.address.landmark}.</p>
                </div>
              </Reveal>

              <Reveal delay={60} className="flex gap-5 py-6">
                <Clock aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold-ink" />
                <div className="min-w-0 flex-1">
                  <h3 className="eyebrow">{business.hoursFallback.label}</h3>
                  <div className="mt-2">
                    <OpeningHours />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120} className="flex gap-5 py-6">
                <Phone aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold-ink" />
                <div>
                  <h3 className="eyebrow">Telefon</h3>
                  <a
                    href={`tel:${business.phone.e164}`}
                    className="mt-1 inline-flex min-h-[44px] items-center text-lg font-medium underline decoration-gold decoration-2 underline-offset-4"
                  >
                    {business.phone.display}
                  </a>
                </div>
              </Reveal>

              <Reveal delay={180} className="flex gap-5 py-6">
                <Wallet aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold-ink" />
                <div>
                  <h3 className="eyebrow">Árszint</h3>
                  <p className="mt-2 text-lg font-medium">{business.priceRange.display}</p>
                </div>
              </Reveal>

              <Reveal delay={240} className="flex gap-5 py-6">
                <Dog aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold-ink" />
                <div>
                  <h3 className="eyebrow">Kutyák</h3>
                  <p className="mt-2 text-lg font-medium">Hozhatod</p>
                  <p className="mt-1 text-muted">A terasz kutyabarát.</p>
                </div>
              </Reveal>

              <Reveal delay={300} className="flex gap-5 py-6">
                <Car aria-hidden className="mt-1 h-5 w-5 shrink-0 text-gold-ink" />
                <div>
                  <h3 className="eyebrow">Érkezés</h3>
                  <p className="mt-2 text-lg font-medium">Autóval a Csányi útról</p>
                  <p className="mt-1 text-muted">
                    A hely egy régi benzinkút, így a beálló és a köré épült terasz messziről
                    látszik.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={business.maps.directionsUrl} variant="primary" size="lg" external>
                Útvonaltervezés
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-normal ease-standard group-hover:translate-x-1"
                />
              </ButtonLink>
              <ButtonLink href={`tel:${business.phone.e164}`} variant="outline" size="lg">
                <Phone aria-hidden className="h-4 w-4" />
                Hívás
              </ButtonLink>
            </Reveal>
          </div>

          {/* Location visual. A photograph of the actual building helps people
              recognise the place far more than an embedded map tile would, and
              costs no third-party script (brief §21). */}
          <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
            <Photo
              name="sorfozde-alkonyat"
              alt="A Csupor sörfőzde és taproom épülete a Csányi úton, naplementében"
              sizes="(min-width: 1024px) 46vw, 100vw"
              aspect="4 / 5"
            />
            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-sm text-muted">
                {business.address.full} — {business.address.landmark}
              </p>
              <a
                href={business.maps.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center text-sm font-medium underline decoration-gold decoration-2 underline-offset-4"
              >
                Megnyitás a térképen
                <span className="sr-only"> (új lapon nyílik meg)</span>
              </a>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --- What the place is like ----------------------------------------- */}
      <Section tone="dark" space="lg">
        <SectionHeading
          eyebrow="A hely"
          title="Taproom bent, terasz kint"
          lead="Bent a tankok mellett ülsz, kint a régi kútbeálló alatt. Nyáron a terasz az igazi."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
          <Reveal>
            <Photo
              name="terasz-nappali"
              alt="A terasz nappali fényben, raklapasztalokkal és gázpalack-ülőkékkel"
              sizes="(min-width: 640px) 46vw, 100vw"
              aspect="4 / 3"
              className="grain"
            />
            <p className="mt-4 text-sm text-muted">
              Raklapasztalok és gázpalack-székek a beálló alatt.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Photo
              name="pohar-a-fozdeben"
              alt="Csupor pohár sörrel az erjesztőtartály előtt"
              sizes="(min-width: 640px) 46vw, 100vw"
              aspect="4 / 3"
              focus="50% 65%"
              className="grain"
            />
            <p className="mt-4 text-sm text-muted">
              A tankok, amikben a pohárba kerülő sör készült.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <ul className="mt-14 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {business.amenities.map((amenity) => (
              <li key={amenity.label} className="border-t-2 border-gold pt-4">
                <p className="font-display text-lg">{amenity.label}</p>
                <p className="mt-1.5 text-sm text-muted">{amenity.detail}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>
    </>
  );
}
