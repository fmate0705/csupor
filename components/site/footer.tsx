import Link from 'next/link';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';

import { business, footerLinks, navigation } from '@/content/business';
import { OpeningHours } from '@/components/site/opening-hours';

/** Small inline Facebook glyph — lucide dropped its brand icons. */
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="on-dark bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-16">
          {/* Identity */}
          <div>
            <img
              src="/logo-white.png"
              alt={business.legalName}
              width={680}
              height={204}
              className="h-8 w-auto"
            />
            <p className="mt-6 max-w-[42ch] text-sm leading-relaxed text-muted">
              {business.description}
            </p>
            <div className="mt-7 flex items-center gap-3">
              <a
                href={business.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center border border-border transition-colors duration-fast hover:border-gold hover:text-gold"
              >
                <Instagram aria-hidden className="h-[18px] w-[18px]" />
                <span className="sr-only">Csupor Craft Beer az Instagramon</span>
              </a>
              <a
                href={business.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center border border-border transition-colors duration-fast hover:border-gold hover:text-gold"
              >
                <FacebookIcon className="h-[18px] w-[18px]" />
                <span className="sr-only">Csupor Craft Beer a Facebookon</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Lábléc navigáció">
            <h2 className="eyebrow">Oldalak</h2>
            {/* No extra row gap: each link is its own 44px touch row. */}
            <ul className="mt-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-muted underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-muted underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Practical details */}
          <div>
            <h2 className="eyebrow">Elérhetőség</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <MapPin aria-hidden className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={business.maps.placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-muted underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline"
                >
                  {business.address.full}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone aria-hidden className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`tel:${business.phone.e164}`}
                  className="inline-flex min-h-[44px] items-center text-muted underline-offset-4 transition-colors duration-fast hover:text-foreground hover:underline"
                >
                  {business.phone.display}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock aria-hidden className="mt-2.5 h-4 w-4 shrink-0 text-gold" />
                <div className="py-1.5 text-muted">
                  <OpeningHours variant="compact" />
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.legalName}. Minden jog fenntartva.
          </p>
          <p>A túlzott alkoholfogyasztás súlyos károkat okoz. 18 éven felülieknek.</p>
        </div>
      </div>
    </footer>
  );
}
