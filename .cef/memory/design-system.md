# Design System

Resolved brand and token decisions for Csupor Craft Beer. The tokens generated
by `cef design tokens` live in `app/globals.css` and are left untouched so they
can be regenerated; every brand decision below is applied on top in
`app/theme.css`.

## Direction

Independent craft brewery, not a restaurant template and not a luxury venue.
Timber, steel and enamel signage. The photography carries the design; type,
spacing and rules do the rest. Restraint over decoration.

## Colour

Warm neutrals rather than the generated slate ramp, which reads cold beside
this photography.

| Token          | Value     | Use                                                        |
| -------------- | --------- | ---------------------------------------------------------- |
| `--ink`        | `#0E0E0D` | Near-black. Dark bands, primary buttons on light.          |
| `--ink-raised` | `#1A1A18` | Raised panel on dark.                                      |
| `--paper`      | `#FFFFFF` | Default page.                                              |
| `--paper-warm` | `#F6F4F0` | Alternating warm band.                                     |
| `--stone-600`  | `#5C574F` | Muted text on light — 7.2:1 on white.                      |
| `--stone-300`  | `#C9C4BA` | Muted text on dark — 9.1:1 on ink.                         |
| `--gold`       | `#E69137` | The brief's secondary. Accents, and text **on dark only**. |
| `--gold-ink`   | `#96560F` | Gold text on light surfaces.                               |

**The two-gold rule.** `#E69137` is 7.79:1 on ink but only **2.48:1 on white** —
it fails AA for text on a light surface at any size. Gold on light is therefore
restricted to non-text use (rules, borders, icon fills behind dark text); where
gold _text_ is needed on light, `--gold-ink` (5.78:1 on white) is used instead.

**Primary action is ink, not gold.** Gold as the dominant CTA colour would make
it the loudest thing on every page, which brief §7 rules out. Gold becomes the
primary only inside a dark band, where it is legible and singular.

## Dark bands

`.on-dark` re-points the semantic tokens at the ink palette, so any component
works inside it with no dark-specific variant. It also re-declares `color` —
`color` inherits as a computed value, so without that, text inside a dark band
keeps the ink colour it inherited from `<body>`. Wrapped in `:where()` so
utilities still win.

Every page opens with a dark band (hero on home, masthead elsewhere). That is
structural, not decorative: it lets the fixed header stay transparent over the
top with the white logo legible, on every route, with no per-page logic.

## Typography

Two families, self-hosted via `next/font`, both subset with `latin-ext` —
Hungarian needs ő and ű, which the base latin subset omits.

- **Archivo Black** — display. Uppercase, tight tracking. Wide and heavy;
  echoes the weight of the logo lockup without copying its geometry.
- **Inter** — body, labels, UI.

**Hungarian sets a hard constraint.** Long compounds in a wide display face
overflow narrow screens: "RAKLAPASZTAL," needs 319px at 36px, wider than a
320px viewport. Two mitigations, both required:

1. Display sizes are fluid (`clamp()`), not fixed steps.
2. `.font-display` sets `hyphens: auto` (using the `hu` patterns declared by
   `<html lang="hu">`) plus `overflow-wrap: break-word` as a hard backstop —
   necessary because beer names are typed into the admin panel and cannot be
   predicted. The hero opts out with `[hyphens:none]`, since its line breaks
   are hand-placed.

## Shape and motion

- Radius is a 2px whisper, never a pill. Enamel signage, not a SaaS dashboard.
- Shadows are warm and shallow; elevation comes from borders and surface
  changes.
- Motion is opacity + a 14px rise on scroll, 620ms, decelerating. Hover states
  are colour and a 1px underline grow. The hero image has a 14s Ken Burns.
  Everything is disabled under `prefers-reduced-motion`.

## Layout

- Container 1200px; prose measure 68ch; wide bands 1440px.
- Rhythm comes from alternating light/warm/dark bands, not from stacking cards.
  The tap list is a rule-separated list, not a card grid — it stays legible at
  three beers or fifteen (D-067: no default three-card row).
- Photography is used at deliberate sizes with overlapping asymmetric pairs on
  the home and brewery pages.

## Components

`Section` + `SectionHeading` (band tone, spacing, eyebrow/title/lead),
`Container`, `Button`/`ButtonLink` (4 variants × 3 sizes, all ≥44px),
`Photo`, `Reveal`, `BeerList`, `VisitBand`, `PageHeader`, `OpeningHours`,
`LocationMap`, `MobileActionBar`.
