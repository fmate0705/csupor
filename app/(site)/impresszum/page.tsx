import type { Metadata } from 'next';

import { PageHeader } from '@/components/sections/page-header';
import { Section } from '@/components/ui/section';
import { business } from '@/content/business';
import { operator } from '@/content/operator';
import { breadcrumbJsonLd, jsonLdScript, webPageJsonLd } from '@/lib/seo/jsonld';

const title = 'Impresszum és adatkezelés';
const description =
  'A Csupor Craft Beer Sörfőzde weboldalának üzemeltetői adatai és adatkezelési tájékoztatója.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/impresszum' },
  // Thin utility page: useful to visitors, not something to rank.
  robots: { index: false, follow: true },
};

/** Renders a value, or a visible marker when the operator has not supplied it. */
function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:gap-6 sm:py-3.5">
      <dt className="w-56 shrink-0 text-sm text-muted">{label}</dt>
      <dd className={value ? 'font-medium' : 'text-muted'}>
        {value ?? <span className="italic">Kitöltendő</span>}
      </dd>
    </div>
  );
}

export default function ImprintPage() {
  const missing = [
    operator.companyName,
    operator.taxNumber,
    operator.registrationNumber,
    operator.email,
  ].some((value) => value === null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageJsonLd({ path: '/impresszum', name: title, description }),
            breadcrumbJsonLd([
              { name: 'Kezdőlap', path: '/' },
              { name: title, path: '/impresszum' },
            ]),
          ]),
        }}
      />

      <PageHeader
        eyebrow="Jogi információk"
        title={<>Impresszum és adatkezelés</>}
        photo="fozde-berendezes"
        photoAlt=""
        focus="50% 40%"
      />

      <Section tone="paper" space="lg" width="prose">
        {missing ? (
          <div className="mb-12 border-l-2 border-danger bg-surface px-6 py-5">
            <p className="font-medium">Kitöltendő adatok</p>
            <p className="mt-2 text-sm text-muted">
              Az alábbi táblázat „Kitöltendő” mezőit a cégadatokkal kell pótolni élesítés előtt. Az
              adatok a <code className="font-mono text-xs">content/operator.ts</code> fájlban
              szerkeszthetők. Ez a szöveg automatikusan eltűnik, amint minden mező kitöltött.
            </p>
          </div>
        ) : null}

        <h2 className="font-display text-2xl">Üzemeltető</h2>
        <dl className="mt-6">
          <Field label="Szolgáltató neve" value={operator.companyName} />
          <Field label="Székhely" value={operator.registeredAddress} />
          <Field label="Telephely" value={business.address.full} />
          <Field label="Cégjegyzékszám" value={operator.registrationNumber} />
          <Field label="Adószám" value={operator.taxNumber} />
          <Field label="E-mail" value={operator.email} />
          <Field label="Telefon" value={business.phone.display} />
          <Field label="Tárhelyszolgáltató" value={operator.hostingProvider} />
        </dl>

        <h2 className="mt-16 font-display text-2xl">Adatkezelési tájékoztató</h2>

        <h3 className="mt-8 font-display text-lg">Milyen adatot kezelünk?</h3>
        <p className="mt-3 text-muted">
          Ez a weboldal önmagában nem gyűjt személyes adatot a látogatóiról. Nincs rajta űrlap,
          hírlevél-feliratkozás és nem használunk webanalitikát. Egyetlen kivétel a beágyazott
          Google-térkép, amelyről alább írunk.
        </p>

        <h3 className="mt-8 font-display text-lg">Beágyazott Google-térkép</h3>
        <p className="mt-3 text-muted">
          A „Gyere el” szakaszban egy Google Maps térkép látható. A térkép a Google szervereiről
          töltődik be, és a betöltéskor a Google megkapja a látogató IP-címét, böngészőadatait,
          valamint sütiket helyezhet el az eszközön. Ezekre az adatkezelésekre a Google saját
          adatvédelmi tájékoztatója az irányadó. A térkép csak akkor épül be az oldalba, amikor a
          látogató odagörget: addig egyetlen kérés sem indul a Google felé. Ha ezt el szeretnéd
          kerülni, a térkép helyett használhatod a szöveges címet és az „Útvonaltervezés” gombot,
          amely csak kattintásra nyit meg külső oldalt.
        </p>

        <h3 className="mt-8 font-display text-lg">Sütik</h3>
        <p className="mt-3 text-muted">
          Saját marketing- vagy analitikai sütit nem használunk. Egyetlen saját sütink a
          bejelentkezési munkamenetet azonosító süti, amely kizárólag akkor jön létre, ha az
          üzemeltető belép a zárt adminisztrációs felületre. Ez a süti a működéshez feltétlenül
          szükséges, ezért nem igényel hozzájárulást, és a kijelentkezéskor, de legkésőbb nyolc óra
          elteltével törlődik. A beágyazott térkép sütijei a Google-tól származnak.
        </p>

        <h3 className="mt-8 font-display text-lg">Szervernaplók</h3>
        <p className="mt-3 text-muted">
          A tárhelyszolgáltató a működés biztonsága érdekében technikai naplót vezethet a
          kiszolgálót ért kérésekről. Ezekre a naplókra a tárhelyszolgáltató saját adatkezelési
          tájékoztatója irányadó.
        </p>

        <h3 className="mt-8 font-display text-lg">Kapcsolatfelvétel</h3>
        <p className="mt-3 text-muted">
          Ha telefonon keresel minket, a hívás során megadott adatokat kizárólag a megkeresés
          megválaszolásához használjuk fel.
        </p>

        <h3 className="mt-8 font-display text-lg">Jogaid</h3>
        <p className="mt-3 text-muted">
          A GDPR alapján tájékoztatást kérhetsz a rólad kezelt adatokról, kérheted azok
          helyesbítését vagy törlését. Ehhez keress minket a fenti elérhetőségeken. Panasszal a
          Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhatsz.
        </p>

        <h3 className="mt-8 font-display text-lg">Fényképek</h3>
        <p className="mt-3 text-muted">
          Az oldalon szereplő fényképek a sörfőzde tulajdonát képezik, felhasználásuk engedély
          nélkül nem megengedett.
        </p>

        <div className="mt-16 border-l-2 border-gold bg-surface px-6 py-5">
          <p className="text-sm text-muted">
            Ez a tájékoztató a weboldal tényleges működését írja le. Ha a főzde a jövőben űrlapot,
            hírlevelet vagy webanalitikát vezet be, a tájékoztatót ki kell egészíteni — és érdemes
            jogi szakértővel ellenőriztetni.
          </p>
        </div>
      </Section>
    </>
  );
}
