'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

import { business } from '@/content/business';
import { cn } from '@/lib/cn';

/**
 * The Google Maps embed for the taproom.
 *
 * The iframe is only added to the DOM once the band scrolls into view. Native
 * `loading="lazy"` is a hint with a generous distance threshold — in testing
 * Chrome contacted Google on initial load without the reader ever reaching the
 * section — and this is third-party content that receives the visitor's IP and
 * sets cookies. Gating it on a real IntersectionObserver makes the behaviour
 * the imprint page describes actually true, and keeps it off the critical path.
 *
 * Until then a styled placeholder holds exactly the same space, so the swap
 * causes no layout shift. If JavaScript never runs, the placeholder remains and
 * the address plus the "Útvonaltervezés" button beside it still do the job.
 */
export function LocationMap({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Start loading just before it is on screen so it is ready on arrival.
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('relative bg-surface', className)}>
      {visible ? (
        <iframe
          src={business.maps.embedUrl}
          title={`${business.legalName} elhelyezkedése a térképen — ${business.address.full}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-0 grayscale-[0.35] contrast-[1.05]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted">
          <MapPin aria-hidden className="h-4 w-4 text-gold" />
          {business.address.full}
        </div>
      )}
    </div>
  );
}
