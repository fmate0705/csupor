'use client';

import { useEffect } from 'react';

import { Button, ButtonLink } from '@/components/ui/button';
import { business } from '@/content/business';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced rather than swallowed (CEF Principle 26). Point this at a
    // monitoring client if one is ever added.
    console.error(error);
  }, [error]);

  return (
    <section className="on-dark flex min-h-[100svh] items-center bg-background pb-24 pt-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-gold" />
          Hiba
        </p>
        <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(2rem,6vw,3.75rem)] leading-[0.98]">
          Valami félrement
        </h1>
        <p className="mt-6 max-w-[48ch] text-lg text-muted">
          Váratlan hiba történt az oldal betöltésekor. Próbáld újra — ha továbbra sem megy, hívj
          minket.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button variant="gold" size="lg" onClick={reset}>
            Újrapróbálkozás
          </Button>
          <ButtonLink href={`tel:${business.phone.e164}`} variant="outline" size="lg">
            {business.phone.display}
          </ButtonLink>
        </div>

        {error.digest ? (
          <p className="mt-10 font-mono text-xs text-muted">Hibaazonosító: {error.digest}</p>
        ) : null}
      </div>
    </section>
  );
}
