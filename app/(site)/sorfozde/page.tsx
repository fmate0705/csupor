import type { Metadata } from 'next';

import { PageHeader } from '@/components/sections/page-header';
import { VisitBand } from '@/components/sections/visit-band';
import { Photo } from '@/components/ui/photo';
import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';
import { business } from '@/content/business';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/seo/jsonld';

const title = 'A sörfőzde';
const description =
  'A Csupor Craft Beer története: 2014 óta főzünk kézműves sört, ma Hatvanban, egy régi benzinkútból kialakított főzdében és taproomban.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/sorfozde' },
  openGraph: { title: `${title} — ${business.name}`, description, url: '/sorfozde' },
};

export default function BreweryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageJsonLd({ path: '/sorfozde', name: title, description }),
            breadcrumbJsonLd([
              { name: 'Kezdőlap', path: '/' },
              { name: title, path: '/sorfozde' },
            ]),
          ]),
        }}
      />

      <PageHeader
        eyebrow={`${business.foundedYear} óta`}
        title={<>Egy kút, ami sörfőzde lett</>}
        lead="Évekig üresen álló benzinkút Hatvan szélén. Ma a kiszolgálótérben tankok állnak, a beálló alatt pedig vendégek ülnek."
        photo="sorfozde-alkonyat"
        photoAlt="A sörfőzde épülete naplementében, előtérben virágokkal"
        focus="50% 45%"
      />

      {/* --- The story ----------------------------------------------------- */}
      <Section tone="paper" space="lg">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
          <div>
            <SectionHeading eyebrow="A történet" title="Előbb a sör volt, aztán a hely" />
            <Reveal delay={60} className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
              <p>
                A Csupor {business.foundedYear} óta létezik. Az első évek receptekről és
                kísérletezésről szóltak — arról, hogy megtaláljuk, milyen sört akarunk valójában
                főzni.
              </p>
              <p>
                A saját hely később jött. Egy régi benzinkút Hatvan szélén, a Csányi úton, ami
                évekig állt kihasználatlanul. A kiszolgálótérbe tankok kerültek, a kútbeálló alá
                asztalok — raklapból, gázpalackból, saját kézzel.
              </p>
              <p className="text-foreground">
                Így lett a főzdéből taproom is: a sör pár méterrel arrébb készül, mint ahol
                megisszák.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative lg:pt-10">
            <Photo
              name="sorfozes-tartaly"
              alt="Sörfőző munka közben a főzőüst mellett"
              sizes="(min-width: 1024px) 42vw, 100vw"
              aspect="3 / 4"
              className="w-[78%] shadow-lg"
            />
            <Photo
              name="sorfozde-viragok"
              alt="A sörfőzde épülete előtti virágok az esti fényben"
              sizes="(min-width: 1024px) 24vw, 50vw"
              aspect="5 / 4"
              className="absolute -bottom-10 right-0 w-[56%] border-4 border-background shadow-xl"
            />
          </Reveal>
        </div>
      </Section>

      {/* --- How we brew ---------------------------------------------------- */}
      <Section tone="dark" space="lg">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <Photo
              name="fozde-berendezes"
              alt="A hatvani főzde rozsdamentes főzőberendezése"
              sizes="(min-width: 1024px) 46vw, 100vw"
              aspect="4 / 5"
              className="grain"
            />
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Ahogy főzünk"
              title="Kis tétel, gyakori csere"
              lead="Nem egyetlen zászlóssört gyártunk nagy mennyiségben. Kis tételekben főzünk, és amint elfogy egy tétel, más kerül a helyére."
            />
            <Reveal delay={80}>
              <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                <div className="border-t border-border pt-5">
                  <dt className="font-display text-lg">Helyben</dt>
                  <dd className="mt-2 text-sm text-muted">
                    A főzde és a taproom ugyanabban az épületben van. Amit iszol, itt készült.
                  </dd>
                </div>
                <div className="border-t border-border pt-5">
                  <dt className="font-display text-lg">Változó kínálat</dt>
                  <dd className="mt-2 text-sm text-muted">
                    Világostól a savanyún át a stoutig — a csapkínálat rendszeresen cserélődik.
                  </dd>
                </div>
                <div className="border-t border-border pt-5">
                  <dt className="font-display text-lg">Közös főzések</dt>
                  <dd className="mt-2 text-sm text-muted">
                    Más hazai főzdékkel is dolgozunk együtt egy-egy tételen.
                  </dd>
                </div>
                <div className="border-t border-border pt-5">
                  <dt className="font-display text-lg">Frissen csapolva</dt>
                  <dd className="mt-2 text-sm text-muted">
                    A söreink elsősorban csapon, itt a helyszínen érhetők el.
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* --- Awards --------------------------------------------------------- */}
      <Section tone="paper" space="lg">
        <SectionHeading
          eyebrow="Elismerések"
          title="Amit eddig összeszedtünk"
          lead="Nem ezért főzünk, de jólesik."
        />
        <ul className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {business.awards.map((award, index) => (
            <Reveal
              as="li"
              key={`${award.year}-${award.title}`}
              delay={index * 80}
              className="bg-background p-8 sm:p-10"
            >
              <p className="font-display text-5xl tabular-nums text-gold-ink">{award.year}</p>
              <p className="mt-5 font-display text-xl">{award.title}</p>
              <p className="mt-2 text-muted">{award.detail}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* --- The people ----------------------------------------------------- */}
      <Section tone="warm" space="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16">
          <SectionHeading
            eyebrow="A csapat"
            title="Kevesen vagyunk"
            lead="Egy kis csapat főzi, csapolja és hordja ki a sört. Ha itt jársz, jó eséllyel azzal beszélgetsz, aki főzte."
          />
          <Reveal delay={100}>
            <Photo
              name="csapat"
              alt="A Csupor csapata a főzde tartályai között"
              sizes="(min-width: 1024px) 56vw, 100vw"
              aspect="21 / 9"
            />
          </Reveal>
        </div>
      </Section>

      <VisitBand />
    </>
  );
}
