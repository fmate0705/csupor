# Csupor Craft Beer — weboldal

A hatvani Csupor Craft Beer Sörfőzde bemutatkozó oldala: négy nyilvános oldal,
plusz egy jelszóval védett felület a sörlista karbantartásához.

Next.js (App Router) · TypeScript · Tailwind · Docker. Built with the
[Claude Enterprise Framework](../../CEF).

---

## Gyors indítás

```bash
pnpm install
cp .env.example .env   # töltsd ki a jelszavakat
pnpm dev
```

A `.env` kötelező mezői:

| Változó                | Mire való                                                                       |
| ---------------------- | ------------------------------------------------------------------------------- |
| `ADMIN_USERNAME`       | Az admin felület felhasználóneve                                                |
| `ADMIN_PASSWORD`       | Jelszó, legalább 12 karakter                                                    |
| `AUTH_SECRET`          | A munkamenet-token aláírására, legalább 32 karakter (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | A publikus cím, a canonical és a sitemap ebből épül                             |
| `DATA_DIR`             | Hová kerül a sörlista (Dockerben `/data`)                                       |

Az alkalmazás **nem indul el** hiányzó `AUTH_SECRET` mellett — szándékosan
nincs alapértelmezett érték, mert az kitalálhatóvá tenné a munkamenetet.

## Docker

Helyi futtatás (ez publikálja a 3000-es portot és helyi hálózatot használ):

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

A `docker-compose.yml` önmagában a **Klivo hosting platform szerződése**:
konténer `hosting_csupor_web`, hálózat `client_csupor_net` (external), kötet
`csupor-data`, port `3000`, publikált host port nélkül. A platform biztonsági
ellenőrzést futtat rajta, és minden más hálózatot elutasít — részletek:
[`deploy/DEPLOY.md`](deploy/DEPLOY.md).

> A panelben a site **`container_port` értékét 3000-re kell állítani**, különben
> a Traefik a 80-as portra irányít, és a site nem érhető el.

A kép többlépcsős, nem-root felhasználóval fut, és van healthcheckje
(`/api/health`). A sörlista a `csupor-data` köteten él, ezért **túléli az
újratelepítést**.

---

## Amit szerkeszteni fogsz

### Üzleti adatok — `content/business.ts`

Cím, telefonszám, nyitvatartás, közösségi linkek, díjak, árszint, adottságok.
**Ez az egyetlen forrás**: a fejléc, a lábléc, a látogatás oldal, a strukturált
adatok és az `llms.txt` mind innen olvas. Sehol máshol nincs leírva.

### Nyitvatartás

Jelenleg `openingHours: null`, mert nem találtunk megbízható, publikált
nyitvatartást, és a taproom szezonális. Amíg üres, az oldal őszintén azt írja,
hogy „Szezonálisan változik", és a telefonszámra irányít.

Valódi nyitvatartás közzétételéhez töltsd ki a `content/business.ts`-ben:

```ts
openingHours: [
  { days: 'Csütörtök – Péntek', hours: '16:00 – 22:00' },
  { days: 'Szombat', hours: '14:00 – 22:00' },
],
openingHoursSpec: [
  { dayOfWeek: ['Thursday', 'Friday'], opens: '16:00', closes: '22:00' },
  { dayOfWeek: ['Saturday'], opens: '14:00', closes: '22:00' },
],
```

Az egész oldal és a Google-nak szóló strukturált adat automatikusan átvált.

### Cégadatok — `content/operator.ts`

Hat mező `null`: cégnév, székhely, cégjegyzékszám, adószám, e-mail,
tárhelyszolgáltató. Az impresszum oldal láthatóan jelzi a hiányt, amíg nincsenek
kitöltve. **Élesítés előtt pótolni kell.**

### Sörök — `/admin`

Belépés a `.env`-ben megadott adatokkal. Hozzáadás, szerkesztés, sorrend,
törlés, és a „Csapon" kapcsoló, ami eldönti, hogy egy sör a fő listában vagy az
„Épp pihen" részben jelenik-e meg. A mentés azonnal élesedik.

### Nyitva / zárva kártya — `/admin`

A kezdőlap tetején megjelenő kis kártya. Három állapota van:

| Állapot             | Mit lát a látogató                                  |
| ------------------- | --------------------------------------------------- |
| **Nyitva**          | „Most nyitva” + a megjegyzés                        |
| **Zárva**           | „Most zárva” + az ok (pl. hogy fesztiválon vagytok) |
| **Nem jelenik meg** | Semmit — a kártya eltűnik az oldalról               |

Alapból **nem jelenik meg**. Ez szándékos: az oldal nem közöl nyitvatartást,
mert nincs megbízható forrás, így egy alapértelmezetten „nyitva” kártya
ellenőrizetlen állítást tenne a főoldalra. Amíg valaki be nem állítja, a főzde
nem állít semmit.

A megjegyzés „Nem jelenik meg” állapotban nem mentődik el, hogy egy régi
fesztiválüzenet ne bukkanjon fel hónapokkal később. Az admin kiírja, mikor
mentetted utoljára, és 24 óra után jelzi, hogy érdemes frissíteni.

### Fényképek

Az eredetiket az `assets/source/` tartalmazza. Csere után:

```bash
pnpm assets
```

Ez újragenerálja a `public/images/` tartalmát és a `lib/image-manifest.ts`-t —
mindkettőt commitolni kell, mert a Docker build nem futtatja ezt a lépést.
Részletek: [`public/images/README.md`](public/images/README.md).

---

## Ellenőrzés

```bash
pnpm verify                    # typecheck + lint + format + unit tesztek
node scripts/validate.mjs http://localhost:3000        # 7 oldal × 5 képernyőméret
node scripts/verify-admin.mjs http://localhost:3000 <user> <pass>
node scripts/verify-map.mjs http://localhost:3000
node scripts/verify-status.mjs http://localhost:3000 <user> <pass>
node scripts/verify-persistence.mjs http://localhost:3000 csupor-web <user> <pass>
```

A `validate.mjs` valódi böngészővel járja végig az oldalakat, és elbukik
konzolhibán, vízszintes túlcsorduláson, hiányzó alt szövegen, törött képen,
rossz címsor-hierarchián, 24px alatti érintési célponton és be nem következett
scroll-animáción. Képernyőképeket ír a `.validation/` mappába.

---

## Szerkezet

```
app/
  (site)/          nyilvános oldalak — a fejléc/lábléc ebben a csoportban él
  admin/           zárt felület: saját héj, nincs marketing navigáció
  api/health/      healthcheck a Dockernek
  llms.txt/        AI-kereőknek szóló összefoglaló, generált
components/
  sections/        oldalspecifikus sávok (hero, tap lista, látogatás)
  site/            fejléc, lábléc, nyitvatartás, térkép, mobil sáv
  ui/              Button, Container, Section, Photo, Reveal
content/           business.ts, operator.ts — az üzleti igazság forrása
lib/
  auth/            JWT munkamenet, jelszó-ellenőrzés, rate limit
  beers/           séma + fájl alapú tároló
  seo/             JSON-LD
scripts/           eszközgenerálás és ellenőrző szkriptek
```

## Tudnivalók

- **A mappa nevében lévő `!` megakadályozza a helyi production buildet.** A
  webpack a `!` karaktert loader-szintaxisra tartja fenn, ezért a
  `F:Klivo! PROJEKTEKCsupor` útvonalon a `pnpm build` elszáll. Megoldás: nevezd
  át a szülőmappát (`!` nélkül), vagy használd helyben a
  `npx next dev --turbopack` parancsot — a Docker build nem érintett, mert az
  `/app` könyvtárban fut. Átnevezés után `pnpm install` kell újra, mert a pnpm
  szimlinkek abszolút útvonalra mutatnak.
- **A fotók 680 képpont szélesek**, ezért nagy méretben szükségszerűen lágyak.
  A képfeldolgozás ezt a lehető legjobban kezeli, de éles hero-képhez a főzdétől
  kellenek az eredeti, 1600px feletti felvételek. Részletek:
  [`public/images/README.md`](public/images/README.md).

- **Nincs webanalitika és nincs sütibanner** — mert nincs mit bekérni. Ha
  bekerül analitika, az adatkezelési tájékoztatót bővíteni kell.
- **A beágyazott Google-térkép** csak akkor tölt be, amikor a látogató
  odagörget. Ez GDPR-szempontból tudatos döntés, lásd
  [`.cef/memory/decisions.md`](.cef/memory/decisions.md).
- **A sörlista szöveges adatai** a főzde saját oldaláról származnak. A
  „Tántorgó ParIPA" nevénél két forrás eltért — érdemes ellenőrizni.
