'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * Reveals its children once, as they scroll into view.
 *
 * Implemented with a single IntersectionObserver and two CSS custom properties
 * rather than an animation library: for a four-page site, importing Framer
 * Motion would cost ~50 KB of JavaScript to move opacity and translateY, which
 * the performance budget does not justify (CEF Principle 13 and 18).
 *
 * Content is visible by default and only hidden once `html.js` is present, so
 * a crawler — or a browser where this never runs — sees the full page.
 * `prefers-reduced-motion` disables the transition entirely in CSS.
 */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className,
  children,
}: {
  as?: 'div' | 'li' | 'article' | 'figure' | 'header';
  /** Stagger, in milliseconds. Keep under ~240ms so nothing feels slow. */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Already in view on load (or no observer support): show immediately.
    if (typeof IntersectionObserver === 'undefined') {
      node.dataset.revealed = 'true';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      },
      // Fire slightly before the element reaches the viewport edge so the
      // motion is finishing, not starting, when the reader gets there.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal=""
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
