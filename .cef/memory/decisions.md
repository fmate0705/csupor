# Decisions

Significant choices and their reasoning (CEF Constitution, Article VIII).
Each entry records the alternatives weighed so a future session builds on the
answer instead of re-litigating it.

---

## [2026-08-08] Information architecture cut to four public pages

**Context.** `cef blueprint` planned eleven pages for the `hospitality`
industry: dashboard, home, reservations, signup, about, admin, contact, login,
menu, gallery, legal. The brief caps the site at four.

**Decision.** Home, Söreink (`/sorok`), A sörfőzde (`/sorfozde`), Látogatás
(`/latogatas`), plus a footer-only `/impresszum` and the auth-gated `/admin`.

**Removed, with reasons.**

| Page         | Why not                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| reservations | The venue takes no bookings. A booking flow would be a false affordance — Article IV forbids interfaces that mislead.                |
| signup       | One operator, credentials from the environment. Public registration would be a security hole with no user need.                      |
| dashboard    | The admin panel has exactly one job (maintain the beer list). A separate authenticated home would be an empty shell.                 |
| gallery      | Brief §25 forbids dumping every photo into a grid. The photography is art-directed into the three content pages.                     |
| contact      | Merged into Látogatás. For a taproom, address + hours + click-to-call _is_ the contact surface; splitting it would split one intent. |

**Alternative rejected.** Letting `cef generate` emit all eleven and deleting
the extras afterwards — that leaves the generation report and the sitemap
describing pages that do not exist.

**Note for future sessions.** `cef pages` and `cef generate` recompute the
blueprint from `.cef/manifest.yaml` every run; there is no page-override lever
in the intelligence engine. Editing `.cef/generated/page-map.json` does _not_
change generation. Re-running `cef generate` will recreate the deleted routes.

---

## [2026-08-08] No animation library

**Decision.** Scroll reveals use one ~40-line `IntersectionObserver` component
(`components/ui/reveal.tsx`) plus CSS transitions. Framer Motion is not
installed.

**Reasoning.** The approved stack lists Framer Motion as the default animation
choice (STK-G1), so this is a recorded exception. The site's entire motion
vocabulary is opacity + a 14px translate + hover transitions. Framer Motion
would add roughly 50 KB gzipped of client JavaScript to do what four CSS
declarations already do, against Principle 13 (performance is a budget) and
Principle 18 (minimal dependencies).

**Revisit if** the design ever needs shared-element transitions, gesture
handling, or interruptible spring physics.

---

## [2026-08-08] Content photography bypasses next/image

**Decision.** `components/ui/photo.tsx` renders a plain `<picture>` against
pre-built AVIF/WebP files listed in `lib/image-manifest.ts`.

**Reasoning.** The source photographs are fixed, few, and known at build time,
so there is nothing for a runtime optimiser to decide. Pre-encoding removes
sharp from the production critical path and gives exact control over the
upscale (the sources are small — see below). `next.config.mjs` still declares
AVIF/WebP so anything later added via `next/image` inherits the right defaults.

---

## [2026-08-08] Supplied photography is low resolution

**Context.** Every source image is at most 680px on the long edge; `hero.webp`
is 680×510. A full-bleed hero at 1440px CSS wants ~2880px for a 2x display.

**Decision.** Ship a conservative 2x lanczos upscale with an unsharp mask for
the images used large, never more than 2x, and mask the softness with a grain
overlay and gradient scrims. Compose the hero so the type sits on a scrim
rather than on fine detail.

**Action for the client.** Request higher-resolution originals. At 1600px+ the
upscale can be dropped entirely by editing `IMAGES` in
`scripts/build-assets.mjs`.

---

## [2026-08-08] Opening hours are left unset rather than guessed

**Context.** The taproom's hours are not published on the brewery's site, and
the one figure found online (Mon–Fri 08:00–17:00, a business directory) is
almost certainly the brewery's office hours, not the taproom's. The taproom is
seasonal.

**Decision.** `business.openingHours` is `null`. Every surface that would show
hours renders "Szezonálisan változik" plus a click-to-call prompt, via one
component (`components/site/opening-hours.tsx`). The `LocalBusiness` JSON-LD
omits `openingHoursSpecification` entirely rather than emitting a guess.

**Reasoning.** Article IV: an honest empty state is premium, a convincing fake
is slop. Publishing plausible hours would send people to a closed door and
would put a false claim in structured data.

**To publish real hours,** fill `openingHours` and `openingHoursSpec` in
`content/business.ts`. Nothing else needs to change.

---

## [2026-08-08] Beer list is a JSON file on a volume, not a database

**Decision.** `lib/beers/store.ts` reads and writes `${DATA_DIR}/beers.json`
with atomic writes (temp file + rename) and a serialised write queue.

**Reasoning.** Fewer than twenty rows, edited a handful of times a week by one
person. Postgres would be more infrastructure than the entire rest of the site
(Principles 5 and 18). The volume `csupor-data` makes it durable across
redeploys.

**Revisit if** the brewery ever needs multiple editors, an audit trail, or more
than one container — the in-memory login rate limiter has the same constraint.

---

## [2026-08-08] Pages that read the beer store render per request

**Context.** `/` and `/sorok` were statically prerendered. `revalidatePath`
patched the copy inside the running container, but a restart reverted both to
the build-time seed list — an admin edit silently disappeared on redeploy. This
was caught by `scripts/verify-persistence.mjs`, not by reasoning.

**Decision.** Both pages export `dynamic = 'force-dynamic'`.

**Reasoning.** Correctness over a few milliseconds of TTFB. Reading a 2 KB JSON
file per request is far cheaper than an admin panel the owner cannot trust.
LCP is dominated by the hero photograph, not by TTFB.

---

## [2026-08-08] Google Maps embed is gated on scroll, not on `loading="lazy"`

**Context.** The client supplied a Maps embed for the "Gyere el" band. With
native `loading="lazy"` alone, Chrome contacted Google on initial page load —
measured, not assumed.

**Decision.** `components/site/location-map.tsx` mounts the iframe only when an
`IntersectionObserver` reports the band approaching the viewport. A placeholder
holds the same space until then, so there is no layout shift.

**Reasoning.** It is third-party content that receives the visitor's IP and
sets cookies. Gating it makes the claim on `/impresszum` actually true and
keeps Google off the critical path. `frame-src https://www.google.com` was
added to the CSP; without it the frame is silently blocked.

**Update.** The map now *replaces* the terrace photograph as the visual half of
the band, at the photograph's original size (`min-h-[280px] lg:min-h-[560px]`),
on the client's instruction. It therefore appears on all three pages that carry
the band — home, sörfőzde and sörök — rather than only the `full` variant. That
costs nothing until each page is scrolled to the band, because of the observer
gate above. The terrace photograph is still used as the `/latogatas` masthead,
so no image became orphaned.

**Open item.** Embedding Maps without prior consent is a known GDPR grey area
in the EU. If the client wants to be strict, change the observer trigger to a
click ("Térkép betöltése") — the component is already structured for it.

---

## [2026-08-08] Docker targets port 3000, not the generator's port 80

**Context.** `cef generate` stage 8 emits a deploy bundle for a Traefik-fronted
host: port 80, container `hosting_<slug>_web`, external network
`client_<slug>_net`.

**Decision.** Replaced with the `standards/operations/docker.md` contract:
`PORT=3000` (ODK-06), container `csupor-web` (ODK-08), network
`csupor-network` (ODK-09), named volume `csupor-data` (ODK-10).

**Reasoning.** Explicit user instruction (precedence 1) asked for port 3000 and
CEF container naming, which is also what the operations standard specifies. The
generated Dockerfile additionally lacked a non-root user, a healthcheck,
resource limits and a frozen lockfile; the replacement has all four.

**Also.** pnpm is installed from npm at a pinned version rather than through
corepack — the corepack bundled with `node:22.12.0-alpine` fails signature
verification when it has to resolve a version, and disabling that check would
be a worse trade.

---

## [2026-08-08] Legal gate accepted as a warn, with reasons

**Context.** The legal gate scores 10/100 because it looks for
`content/legal/{privacy-policy,terms,cookie-policy}.md`. Those files existed as
English templates full of `[Company Name]` placeholders and were deleted.

**Decision.** One Hungarian `/impresszum` page carries the imprint, the privacy
notice and the cookie disclosure. No terms of service.

**Reasoning.** The generated templates were exactly the placeholder content
Article IV prohibits shipping. A terms of service would be ceremonial on a
brochure site with no account, no transaction and no user content. Creating
stub markdown files purely to satisfy a file-existence check would be gaming
the gate while making the content worse.

**Genuinely outstanding — this is not waived:**

1. `content/operator.ts` has six `null` fields (company name, registered
   address, company registration number, tax number, e-mail, hosting provider).
   The imprint page renders a visible "Kitöltendő" marker and a warning banner
   until they are filled. **These must be supplied before launch.**
2. The privacy text describes what the site actually does, but it has not been
   reviewed by a Hungarian lawyer. The gate's warning on this point stands.

---

## [2026-08-08] Review findings recorded as scanner limitations

The following review issues were verified as false positives against a running
production build, not fixed:

- **`content`: "Internal link /sorok has no matching page"** (×8). The scanner
  does not resolve the `app/(site)/` route group. All routes return HTTP 200 —
  verified across 7 pages × 5 viewports by `scripts/validate.mjs`.
- **`seo`: missing `app/opengraph-image.tsx`.** Replaced by a static
  `public/og.jpg` built from the real hero photograph in the asset pipeline,
  which is better than a generated card and is declared in the metadata.
- **`seo`: missing `public/security.txt`.** The generated file advertised an
  unmonitored `security@` mailbox behind a "replace before launch" comment. A
  security contact that does not exist is worse than none, so it was removed
  rather than left as placeholder content.
- **`seo`: missing `public/manifest.webmanifest` and `public/llms.txt`.** Both
  are now generated by route handlers (`app/manifest.ts`, `app/llms.txt/route.ts`)
  instead of being static files, and both serve correctly:
  `/manifest.webmanifest` returns 200 `application/manifest+json`, `/llms.txt`
  returns 200 `text/plain`. The static versions were replaced *because they had
  gone stale* — the checked-in `llms.txt` advertised six routes that no longer
  existed and described the brewery as "a professional hospitality presence",
  and the manifest carried the project slug as the app name, the framework's
  default blue as the theme colour, and an `/icon.svg` that was never generated.
  Generating them from `content/business.ts` means they cannot drift again.
  The gate checks for files on disk; crawlers request URLs.
- **`seo`: missing `public/humans.txt` / `public/schema.json`.** Optional
  artifacts. Structured data is inlined as JSON-LD per page, which is the
  documented recommendation.
- **`seo`: admin pages declare no canonical URL.** They are deliberately
  `noindex, nofollow`; advertising a canonical for an auth-gated page would
  only invite crawling.
