import { ArrowRight, MapPin } from 'lucide-react';

import { OpenStatus } from '@/components/sections/open-status';
import { ButtonLink } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { business } from '@/content/business';

/**
 * Home hero.
 *
 * The photograph does the talking: a Csupor glass in the foreground, the
 * taproom and its people behind it, late afternoon. The headline names the
 * thing and the place; the strapline supplies the two facts that decide a
 * visit (own brewery, own terrace).
 *
 * Exactly one primary action — "see the beers" — with directions as a quiet
 * secondary (D-042, D-048). The scrim is a two-stop gradient rather than a flat
 * overlay so the glass stays bright while the type below it stays at AA.
 */
export async function Hero() {
  return (
    <section className="on-dark relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-background pb-20 pt-32 sm:pb-24 lg:min-h-[92vh] lg:pb-28">
      <div className="grain absolute inset-0 -z-10">
        <Photo
          name="hero-terasz-sor"
          alt="Csupor pohár friss sörrel a taproom teraszán, háttérben vendégekkel"
          sizes="100vw"
          priority
          aspect="auto"
          focus="60% 50%"
          className="h-full w-full bg-background"
          imgClassName="animate-kenburns"
        />
        {/*
          Two scrims rather than one flat overlay.

          Vertical: anchors the type block at the bottom and darkens the sky.
          Horizontal (from lg up): darkens the left third where the headline
          sits, while leaving the glass on the right bright — the photograph's
          subject stays the brightest thing in the frame instead of being
          uniformly dimmed.
        */}
        {/* Mobile carries the whole burden alone (no horizontal scrim below
            lg), and the copy sits directly over the brightest part of the
            glass, so it is weighted harder here and eased off from lg up. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(14_14_13/0.96)_0%,rgb(14_14_13/0.9)_38%,rgb(14_14_13/0.66)_68%,rgb(14_14_13/0.5)_100%)] lg:bg-[linear-gradient(to_top,rgb(14_14_13/0.95)_0%,rgb(14_14_13/0.78)_30%,rgb(14_14_13/0.45)_62%,rgb(14_14_13/0.55)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block lg:bg-[linear-gradient(to_right,rgb(14_14_13/0.82)_0%,rgb(14_14_13/0.55)_34%,rgb(14_14_13/0.05)_60%,transparent_75%)]"
        />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {/* Capped short of the glass so the headline never runs across it. */}
        <div className="max-w-[34rem] lg:max-w-[38rem]">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-gold" />
            Hatvan · {business.foundedYear} óta
          </p>

          {/* Line breaks are hand-placed, so the automatic hyphenation that
              protects long Hungarian words elsewhere is switched off here. */}
          <h1 className="mt-6 font-display text-[clamp(2.25rem,7vw,4.5rem)] leading-[0.94] tracking-[-0.03em] [hyphens:none]">
            Ott isszuk,
            <br />
            ahol <span className="text-gold">főzzük</span>
          </h1>

          <p className="mt-7 max-w-[44ch] text-lg text-foreground/90 sm:text-xl">
            Kézműves sörfőzde, taproom és terasz egy régi benzinkúton. A csapon az van, amit néhány
            méterrel arrébb főztünk — és hetente változik.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href="/sorok" variant="gold" size="lg">
              Mi van a csapon
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform duration-normal ease-standard group-hover:translate-x-1"
              />
            </ButtonLink>
            <ButtonLink href="/latogatas" variant="outline" size="lg">
              <MapPin aria-hidden className="h-4 w-4" />
              Hogyan találsz ide
            </ButtonLink>
          </div>

          {/*
            Placed after the actions, not before them: someone reading the hero
            decides "what is this" then "can I go now". It also keeps the
            headline block uninterrupted. Renders nothing while the brewery has
            not set a state.
          */}
          <div className="mt-8">
            <OpenStatus />
          </div>
        </div>
      </div>
    </section>
  );
}
