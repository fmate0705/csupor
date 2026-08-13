import { business } from '@/content/business';

/**
 * Renders the opening hours — or, while none are confirmed, says so plainly.
 *
 * The brewery does not publish taproom hours anywhere verifiable and the
 * taproom is seasonal. Printing a plausible-looking schedule would send people
 * to a closed door, so this falls back to the truth plus the phone number.
 * CEF Article IV: an honest empty state is premium, a convincing fake is slop.
 *
 * Fill in `business.openingHours` and this switches to the real table
 * everywhere it is used, with no other change.
 */
export function OpeningHours({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const hours = business.openingHours;

  if (!hours || hours.length === 0) {
    if (variant === 'compact') {
      return (
        <>
          <span className="block">{business.hoursFallback.value}</span>
          <a
            href={`tel:${business.phone.e164}`}
            className="inline-flex min-h-[44px] items-center underline underline-offset-4 transition-colors duration-fast hover:text-foreground"
          >
            Hívj a pontos nyitvatartásért
          </a>
        </>
      );
    }

    return (
      <div>
        <p className="text-lg font-medium">{business.hoursFallback.value}</p>
        <p className="mt-2 text-muted">{business.hoursFallback.help}</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        {hours.map((row) => (
          <span key={row.days} className="block">
            {row.days}: {row.hours}
          </span>
        ))}
      </>
    );
  }

  return (
    <dl className="divide-y divide-border">
      {hours.map((row) => (
        <div key={row.days} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-muted">{row.days}</dt>
          <dd className="font-medium tabular-nums">{row.hours}</dd>
        </div>
      ))}
    </dl>
  );
}
