import type { Metadata } from 'next';

import { BeerList } from '@/components/sections/beer-list';
import { PageHeader } from '@/components/sections/page-header';
import { VisitBand } from '@/components/sections/visit-band';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { business } from '@/content/business';
import { listBeers } from '@/lib/beers/store';
import { breadcrumbJsonLd, jsonLdScript, tapListJsonLd, webPageJsonLd } from '@/lib/seo/jsonld';

const title = 'Söreink';
const description =
  'A Csupor Craft Beer aktuális sörválasztéka: stílus, alkoholtartalom és kóstolójegyzet minden csapon lévő sörhöz. A kínálat rendszeresen változik.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/sorok' },
  openGraph: { title: `${title} — ${business.name}`, description, url: '/sorok' },
};

/**
 * Rendered per request, not prerendered at build.
 *
 * The beer list lives in a JSON file on a mounted volume. A statically
 * prerendered page bakes the build-time seed into HTML, and `revalidatePath`
 * only patches that copy inside the running container — so every restart or
 * redeploy would silently serve the seed list again and quietly discard the
 * operator's edits. Reading the file per request costs well under a
 * millisecond and makes the page always true.
 */
export const dynamic = 'force-dynamic';

export default async function BeersPage() {
  const all = await listBeers();
  const onTap = all.filter((beer) => beer.onTap);
  const resting = all.filter((beer) => !beer.onTap);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageJsonLd({ path: '/sorok', name: title, description }),
            tapListJsonLd(onTap),
            breadcrumbJsonLd([
              { name: 'Kezdőlap', path: '/' },
              { name: title, path: '/sorok' },
            ]),
          ]),
        }}
      />

      <PageHeader
        eyebrow="Söreink"
        title={<>Ez van most a csapon</>}
        lead="Kis tételben főzünk, ezért a választék hétről hétre változik. Ha egy tétel elfogy, a helyére új kerül."
        photo="pohar-a-fozdeben"
        photoAlt="Csupor pohár sörrel az erjesztőtartály előtt a főzdében"
        // The glass sits low and left of centre in the source; a centred crop
        // in this wide masthead loses it entirely.
        focus="37% 74%"
      />

      <Section tone="paper" space="lg">
        {/* The list items are h3, so this h2 keeps the outline contiguous. It is
            not shown because the page title already says it. */}
        <h2 className="sr-only">Csapon lévő söreink</h2>
        <BeerList beers={onTap} />

        {resting.length > 0 ? (
          <div className="mt-20">
            <Reveal>
              <h2 className="eyebrow flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-gold" />
                Épp pihen
              </h2>
              <p className="mt-4 max-w-[52ch] text-muted">
                Ezek most nincsenek csapon, de visszatérnek.
              </p>
            </Reveal>
            <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-3">
              {resting.map((beer) => (
                <li key={beer.id} className="border border-border px-4 py-2.5 text-sm text-muted">
                  <span className="font-medium text-foreground">{beer.name}</span>
                  <span className="mx-2 text-border" aria-hidden>
                    ·
                  </span>
                  {beer.style}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Reveal className="mt-20 border-l-2 border-gold bg-surface px-6 py-7 sm:px-8">
          <p className="max-w-[62ch] text-muted">
            A csapkínálat naponta változhat. Ha egy konkrét sörért indulnál el,{' '}
            <a
              href={`tel:${business.phone.e164}`}
              className="font-medium text-foreground underline decoration-gold decoration-2 underline-offset-4"
            >
              hívj minket a {business.phone.display} számon
            </a>{' '}
            — megmondjuk, mi van a csapon.
          </p>
        </Reveal>
      </Section>

      <VisitBand variant="compact" />
    </>
  );
}
