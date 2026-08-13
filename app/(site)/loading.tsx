/**
 * Route-level loading state. Mirrors the dark masthead every page opens with,
 * so the transition is a fade into the same shape rather than a flash of a
 * different layout (D-086, skeleton parity).
 */
export default function Loading() {
  return (
    <div
      className="on-dark min-h-[60svh] bg-background pb-20 pt-32 sm:pt-40"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Betöltés…</span>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="h-3 w-28 animate-pulse bg-surface" />
        <div className="mt-6 h-12 w-[min(24ch,90%)] animate-pulse bg-surface sm:h-16" />
        <div className="mt-4 h-12 w-[min(16ch,70%)] animate-pulse bg-surface sm:h-16" />
        <div className="mt-8 h-5 w-[min(44ch,100%)] animate-pulse bg-surface" />
      </div>
    </div>
  );
}
