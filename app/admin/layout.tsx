import type { Metadata } from 'next';

/**
 * The admin panel is an application shell, not a page of the public site — it
 * gets no marketing navbar, footer or mobile action bar.
 *
 * It is also explicitly noindex/nofollow. The CEF admin-panel capability
 * excludes the discoverability engine but still requires the robots state to be
 * set deliberately rather than left to a default.
 */
export const metadata: Metadata = {
  title: { default: 'Adminisztráció', template: '%s — Csupor admin' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{children}</div>;
}
