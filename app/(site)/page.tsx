import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { BeerList } from '@/components/sections/beer-list';
import { Hero } from '@/components/sections/hero';
import { VisitBand } from '@/components/sections/visit-band';
import { ButtonLink } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';
import { business } from '@/content/business';
import { listBeersOnTap } from '@/lib/beers/store';
import { jsonLdScript, webPageJsonLd } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  // `absolute` bypasses the "%s — Csupor Craft Beer" template, which would
  // otherwise append the brand name a second time.
  title: { absolute: `${business.name} — ${business.tagline}` },
  description:
    'Kézműves sörfőzde, taproom és terasz Hatvanban, 2014 óta. Nézd meg, mi van most a csapon, és gyere el hozzánk a Csányi útra.',
  alternates: { canonical: '/' },
};

/** How many beers the teaser shows before sending the reader to the full list. */
const TEASER_COUNT = 4;

/**
 * Rendered per request: the tap teaser reads the same volume-backed store as
 * /sorok, and a build-time prerender would serve the seed list again after
 * every restart. See the note on the beers page.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const onTap = await listBeersOnTap();
  const teaser = onTap.slice(0, TEASER_COUNT);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            webPageJsonLd({
              path: '/',
              name: `${business.name} — ${business.tagline}`,
              description: business.description,
            }),
          ),
        }}
      />

      <Hero />

      {/* --- What this place is ------------------------------------------- */}
      <Section tone="paper" space="lg">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="A főzde"
              title={
                <>
                  Nyolc tank, egy
                  <br />
                  régi benzinkút
                </>
              }
              lead="2014-ben kezdtünk sört főzni. Ma Hatvan szélén, egy évekig üresen álló kúton főzünk — a kiszolgálótérben állnak a tankok, a beálló alatt pedig a teraszunk."
            />
            <Reveal delay={80}>
              <p className="mt-6 max-w-[58ch] text-muted">
                Nem gyártunk, hanem főzünk: kis tételben, gyakran cserélve, azt, amit magunk is
                szívesen iszunk. Ezért változik a csapkínálat hétről hétre.
              </p>
              <div className="mt-9">
                <ButtonLink href="/sorfozde" variant="ghost" size="md">
                  A sörfőzde története
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 transition-transform duration-normal ease-standard group-hover:translate-x-1"
                  />
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* Overlapping pair — the asymmetric composition the brief asks for. */}
          <Reveal delay={120} className="relative">
            <Photo
              name="sorfozes-kozben"
              alt="Sörfőző a főzőüst nyitott búvónyílása fölé hajol a hatvani főzdében"
              sizes="(min-width: 1024px) 44vw, 100vw"
              aspect="4 / 5"
              className="ml-auto w-[82%] shadow-lg"
            />
            <Photo
              name="tartaly-kulteri"
              alt="Csupor Craft Beer feliratú rozsdamentes tartály a főzde falánál, naplementében"
              sizes="(min-width: 1024px) 22vw, 45vw"
              aspect="4 / 3"
              className="absolute -bottom-8 left-0 w-[52%] border-4 border-background shadow-xl sm:-bottom-10 sm:w-[46%]"
            />
          </Reveal>
        </div>
      </Section>

      {/* --- What's on tap ------------------------------------------------- */}
      <Section tone="warm" space="lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Most a csapon"
            title="Söreink"
            lead="A választék rendszeresen cserélődik. Ez van most a csapon."
          />
          <Reveal delay={80} className="shrink-0">
            <ButtonLink href="/sorok" variant="outline" size="md">
              Mind a {onTap.length}
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-normal ease-standard group-hover:translate-x-1"
              />
            </ButtonLink>
          </Reveal>
        </div>

        <BeerList beers={teaser} className="mt-12" />
      </Section>

      {/* --- The terrace, full bleed --------------------------------------- */}
      <Section tone="dark" space="lg" bleed>
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
            <Reveal className="relative">
              <Photo
                name="terasz-nappali"
                alt="A Csupor terasz raklapasztalokkal és gázpalack-székekkel a régi kútbeálló alatt"
                sizes="(min-width: 1024px) 56vw, 100vw"
                aspect="16 / 10"
                className="grain"
              />
            </Reveal>
            <div>
              <SectionHeading
                eyebrow="A terasz"
                title="Raklapasztal, kútbeálló, hosszú esték"
                lead="Az asztalok raklapból, a székek gázpalackból. A tető az, ami a kutakat védte. Kutyát hozhatsz, és nem kell asztalt foglalnod."
              />
              <Reveal delay={80}>
                <ul className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {business.amenities.map((amenity) => (
                    <li key={amenity.label} className="border-t border-border pt-4">
                      <p className="font-display text-lg">{amenity.label}</p>
                      <p className="mt-1 text-sm text-muted">{amenity.detail}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </Section>

      {/* --- Credibility ---------------------------------------------------- */}
      <Section tone="paper" space="md">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
          <SectionHeading eyebrow="Elismerések" title="Nem csak mi szeretjük" />
          <Reveal delay={80}>
            <ul className="grid gap-8 sm:grid-cols-2">
              {business.awards.map((award) => (
                <li key={`${award.year}-${award.title}`} className="border-t-2 border-gold pt-5">
                  <p className="font-display text-4xl tabular-nums text-foreground/85">
                    {award.year}
                  </p>
                  <p className="mt-3 font-medium">{award.title}</p>
                  <p className="mt-1.5 text-sm text-muted">{award.detail}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <VisitBand />
    </>
  );
}
