import { MapPin, Phone } from 'lucide-react';

import { business } from '@/content/business';

/**
 * Bottom-anchored actions, mobile only.
 *
 * The two things a phone visitor actually wants — call, and get directions —
 * kept permanently in thumb reach (CEF D-103). Hidden from `lg` up, where both
 * live in the header and the visit page instead.
 *
 * `pb-[env(safe-area-inset-bottom)]` keeps it clear of the iOS home indicator.
 */
export function MobileActionBar() {
  return (
    <div className="on-dark fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-2 pb-[env(safe-area-inset-bottom)]">
        <a
          href={`tel:${business.phone.e164}`}
          className="flex h-14 items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] transition-colors duration-fast active:bg-surface"
        >
          <Phone aria-hidden className="h-4 w-4 text-gold" />
          Hívás
        </a>
        <a
          href={business.maps.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2 border-l border-border text-sm font-semibold uppercase tracking-[0.1em] transition-colors duration-fast active:bg-surface"
        >
          <MapPin aria-hidden className="h-4 w-4 text-gold" />
          Útvonal
        </a>
      </div>
    </div>
  );
}
