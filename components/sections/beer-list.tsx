import { Reveal } from '@/components/ui/reveal';
import type { Beer } from '@/lib/beers/schema';
import { cn } from '@/lib/cn';

/** Formats ABV the Hungarian way, or nothing when it is genuinely unknown. */
function abvLabel(abv: number | null): string | null {
  if (abv === null) return null;
  return `${abv.toString().replace('.', ',')}%`;
}

/**
 * One row of the tap list.
 *
 * Deliberately a rule-separated list rather than a grid of cards: a tap list is
 * something you read top to bottom, and it stays legible whether there are
 * three beers on it or fifteen (brief §14 — not every section is a card;
 * D-067 — no default three-card row).
 */
function BeerRow({ beer, index }: { beer: Beer; index: number }) {
  const abv = abvLabel(beer.abv);

  return (
    <Reveal
      as="li"
      delay={Math.min(index * 60, 240)}
      className="group border-t border-border transition-colors duration-normal ease-standard last:border-b hover:bg-surface/70"
    >
      <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-baseline sm:gap-8 sm:py-8">
        <span aria-hidden className="font-mono text-xs tabular-nums text-muted sm:w-10 sm:shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className="font-display text-2xl sm:text-[1.75rem]">{beer.name}</h3>
            {beer.seasonal ? (
              <span className="border border-gold-ink/40 bg-gold-wash px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-gold-ink">
                Szezonális
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm uppercase tracking-[0.1em] text-muted">{beer.style}</p>
          {beer.notes ? <p className="mt-3 max-w-[60ch] text-muted">{beer.notes}</p> : null}
        </div>

        {abv ? (
          <p className="shrink-0 font-display text-xl text-foreground/70 transition-colors duration-normal group-hover:text-gold-ink sm:w-24 sm:text-right sm:text-2xl">
            {abv}
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}

export function BeerList({ beers, className }: { beers: readonly Beer[]; className?: string }) {
  // Empty state (D-070, D-083). Real and useful rather than a shrug.
  if (beers.length === 0) {
    return (
      <div className={cn('border border-dashed border-border px-6 py-16 text-center', className)}>
        <p className="font-display text-2xl">Épp cserélünk a csapokon</p>
        <p className="mx-auto mt-3 max-w-[42ch] text-muted">
          A következő tételek még érnek. Hívj minket, és megmondjuk, mi lesz a csapon, mire ideérsz.
        </p>
      </div>
    );
  }

  return (
    <ul className={cn(className)}>
      {beers.map((beer, index) => (
        <BeerRow key={beer.id} beer={beer} index={index} />
      ))}
    </ul>
  );
}
