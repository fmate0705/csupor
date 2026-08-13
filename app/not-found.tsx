import Link from 'next/link';

import { ButtonLink } from '@/components/ui/button';
import { navigation } from '@/content/business';

export default function NotFound() {
  return (
    <section className="on-dark flex min-h-[100svh] items-center bg-background pb-24 pt-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-gold" />
          404
        </p>
        <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(2.25rem,7vw,4.5rem)] leading-[0.96]">
          Ez a korsó üres
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg text-muted">
          A keresett oldal nem létezik, vagy időközben elköltözött. Innen viszont bárhová eljutsz.
        </p>

        <div className="mt-10">
          <ButtonLink href="/" variant="gold" size="lg">
            Vissza a kezdőlapra
          </ButtonLink>
        </div>

        <nav aria-label="Oldalak" className="mt-14 border-t border-border pt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {navigation.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center text-muted underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
