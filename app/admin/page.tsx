import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { logoutAction } from '@/app/admin/actions';
import { BeerAdminList } from '@/app/admin/beer-admin-list';
import { NewBeerForm } from '@/app/admin/new-beer-form';
import { Button } from '@/components/ui/button';
import { listBeers } from '@/lib/beers/store';

export const metadata: Metadata = {
  title: 'Söradminisztráció',
  // No canonical: this surface is intentionally noindex, and advertising a
  // canonical URL for an auth-gated page would only invite crawling.
  robots: { index: false, follow: false, nocache: true },
};

/** The store is a file on a volume, so this page must never be cached. */
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const beers = await listBeers();
  const onTapCount = beers.filter((beer) => beer.onTap).length;

  return (
    <div className="min-h-screen bg-surface">
      <header className="on-dark bg-background">
        <div className="mx-auto flex max-w-[1000px] flex-wrap items-center gap-4 px-5 py-5 sm:px-8">
          <img
            src="/logo-white.png"
            alt="Csupor Craft Beer"
            width={680}
            height={204}
            className="h-6 w-auto"
          />
          <span className="text-sm text-muted">Söradminisztráció</span>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/sorok"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted transition-colors hover:text-foreground"
            >
              <ExternalLink aria-hidden className="h-4 w-4" />
              Oldal
              <span className="sr-only"> megtekintése új lapon</span>
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Kilépés
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1000px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl">Söreink</h1>
          <p className="text-sm text-muted">
            <strong className="font-semibold text-foreground">{onTapCount}</strong> csapon ·{' '}
            {beers.length} összesen
          </p>
        </div>
        <p className="mt-3 max-w-[62ch] text-sm text-muted">
          A „Csapon” kapcsoló dönti el, hogy egy sör megjelenik-e a nyilvános oldalon. A
          kikapcsoltak az „Épp pihen” listába kerülnek. A mentés azonnal élesedik.
        </p>

        <NewBeerForm />

        <h2 className="mt-14 font-display text-xl">A lista</h2>
        <BeerAdminList beers={beers} />
      </main>
    </div>
  );
}
