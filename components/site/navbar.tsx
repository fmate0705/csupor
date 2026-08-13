'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';

import { business, navigation } from '@/content/business';
import { cn } from '@/lib/cn';

/**
 * Site header.
 *
 * Every page opens with a dark band (the hero on the home page, a dark masthead
 * elsewhere), so the bar can sit transparent over the top and turn solid ink
 * once the reader scrolls past it. That keeps the white logo legible everywhere
 * without any per-page configuration.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Solidify the bar once the dark masthead has largely scrolled past.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While the panel is open: lock scrolling, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      className={cn(
        'on-dark fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-normal ease-standard',
        scrolled || open
          ? 'border-b border-border bg-background/95 backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-black/55 to-transparent',
      )}
    >
      <nav
        aria-label="Fő navigáció"
        className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:h-20 lg:px-10"
      >
        <Link
          href="/"
          aria-label={`${business.name} — kezdőlap`}
          className="flex h-11 shrink-0 items-center transition-opacity duration-fast hover:opacity-80"
        >
          {/* Intrinsic 680x204; rendered at 148px wide. */}
          <img
            src="/logo-white.png"
            alt={business.name}
            width={680}
            height={204}
            className="h-[26px] w-auto sm:h-[30px]"
          />
        </Link>

        <ul className="ml-auto hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative py-2 text-sm font-medium tracking-wide transition-colors duration-fast',
                  'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-normal after:ease-standard',
                  'hover:after:scale-x-100 focus-visible:after:scale-x-100',
                  isActive(item.href)
                    ? 'text-foreground after:scale-x-100'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={`tel:${business.phone.e164}`}
          className="ml-auto hidden h-11 items-center gap-2 border border-foreground/25 px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-fast hover:border-gold hover:text-gold lg:ml-0 lg:inline-flex"
        >
          <Phone aria-hidden className="h-4 w-4" />
          {business.phone.display}
        </a>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center border border-foreground/25 lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          <span className="sr-only">{open ? 'Menü bezárása' : 'Menü megnyitása'}</span>
        </button>
      </nav>

      {/* Mobile disclosure panel (D-061). */}
      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="on-dark border-t border-border bg-background lg:hidden"
      >
        <ul className="px-5 py-2 sm:px-8">
          {navigation.map((item) => (
            <li key={item.href} className="border-b border-border/60 last:border-b-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-between py-4 font-display text-2xl',
                  isActive(item.href) ? 'text-gold' : 'text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 pb-6 pt-2 sm:px-8">
          <a
            href={`tel:${business.phone.e164}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-gold px-6 text-sm font-semibold uppercase tracking-[0.12em] text-accent-foreground"
          >
            <Phone aria-hidden className="h-4 w-4" />
            {business.phone.display}
          </a>
        </div>
      </div>
    </header>
  );
}
