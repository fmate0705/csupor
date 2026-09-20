import { readStatus } from '@/lib/status/store';

/**
 * The "are they open right now" card in the hero.
 *
 * Renders nothing at all in the `hidden` state — the brewery claims nothing
 * until someone sets it in the admin panel.
 *
 * Design notes: this is a small enamel plaque, not a badge. No pill, no tracked
 * eyebrow label. The state is set in the display face so it reads as a heading,
 * the reason sits under it as quiet body copy, and a 2px rule down the left
 * edge carries the colour — gold when open, muted when not. The panel is ink at
 * 55% with a blur behind it, so the photograph still shows through and the card
 * belongs to the hero rather than sitting on top of it.
 */
export async function OpenStatus() {
  const status = await readStatus();
  if (status.mode === 'hidden') return null;

  const isOpen = status.mode === 'open';

  return (
    <div
      // Not a live region: this is server-rendered and does not change while
      // the page is open, so `role="status"` would make screen readers
      // announce static content. The state is in the text itself.
      data-open-status={status.mode}
      className="relative inline-flex max-w-full items-start gap-4 overflow-hidden rounded-md border border-border/80 bg-background/55 py-4 pl-5 pr-6 backdrop-blur-md sm:pl-6"
    >
      {/* Colour-bearing edge. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[2px] ${isOpen ? 'bg-gold' : 'bg-muted/80'}`}
      />

      {/* Dot. Colour is never the only signal — the words say it too (D-038). */}
      <span aria-hidden className="relative mt-[7px] flex h-2 w-2 shrink-0">
        {isOpen ? (
          <span className="absolute inset-0 animate-status-halo rounded-full bg-gold" />
        ) : null}
        <span className={`relative h-2 w-2 rounded-full ${isOpen ? 'bg-gold' : 'bg-muted/70'}`} />
      </span>

      <span className="min-w-0">
        <span className="block font-display text-lg leading-none">
          {isOpen ? 'Most nyitva' : 'Most zárva'}
        </span>
        {status.note ? (
          <span className="mt-2 block max-w-[34ch] text-sm leading-snug text-muted">
            {status.note}
          </span>
        ) : null}
      </span>
    </div>
  );
}
