'use client';

import type { Beer } from '@/lib/beers/schema';

/**
 * The beer form fields, shared by the "add" and "edit" forms so the two can
 * never drift apart (CEF Principle 8).
 */

const inputClass =
  'mt-1.5 h-11 w-full border border-border bg-background px-3 text-foreground placeholder:text-muted/60';

export function BeerFields({ beer, idPrefix }: { beer?: Beer; idPrefix: string }) {
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-1">
        <label htmlFor={id('name')} className="text-sm font-medium">
          Név
        </label>
        <input
          id={id('name')}
          name="name"
          type="text"
          required
          maxLength={80}
          defaultValue={beer?.name}
          placeholder="Thrash Lager"
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor={id('style')} className="text-sm font-medium">
          Stílus
        </label>
        <input
          id={id('style')}
          name="style"
          type="text"
          required
          maxLength={80}
          defaultValue={beer?.style}
          placeholder="Német típusú pils"
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-1">
        <label htmlFor={id('abv')} className="text-sm font-medium">
          Alkohol (%)
        </label>
        <input
          id={id('abv')}
          name="abv"
          type="text"
          inputMode="decimal"
          defaultValue={beer?.abv ?? ''}
          placeholder="4.8"
          aria-describedby={id('abv-help')}
          className={inputClass}
        />
        <p id={id('abv-help')} className="mt-1.5 text-xs text-muted">
          Üresen hagyható, ha még nincs mért érték.
        </p>
      </div>

      <fieldset className="sm:col-span-1">
        <legend className="text-sm font-medium">Állapot</legend>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="onTap"
              defaultChecked={beer?.onTap ?? true}
              className="h-5 w-5 accent-[rgb(var(--gold))]"
            />
            Csapon
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="seasonal"
              defaultChecked={beer?.seasonal ?? false}
              className="h-5 w-5 accent-[rgb(var(--gold))]"
            />
            Szezonális
          </label>
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <label htmlFor={id('notes')} className="text-sm font-medium">
          Kóstolójegyzet
        </label>
        <textarea
          id={id('notes')}
          name="notes"
          rows={3}
          maxLength={400}
          defaultValue={beer?.notes}
          placeholder="Egy-két mondat arról, milyen."
          className="mt-1.5 w-full border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted/60"
        />
      </div>
    </div>
  );
}
