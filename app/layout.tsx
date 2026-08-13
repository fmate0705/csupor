import type { Metadata, Viewport } from 'next';
import { Archivo_Black, Inter } from 'next/font/google';

import './globals.css';
import './theme.css';

import { business } from '@/content/business';
import { siteUrl } from '@/lib/site-url';

/**
 * Root layout — document shell only.
 *
 * The public site's chrome (header, footer, mobile action bar) lives in
 * `app/(site)/layout.tsx`, so the admin panel can render as a bare application
 * shell without inheriting marketing navigation.
 *
 * Two families, self-hosted by next/font: no render-blocking third-party
 * request and no layout shift (brief §8, §17). `latin-ext` is required rather
 * than optional — Hungarian needs ő and ű, which the base latin subset omits.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

const archivo = Archivo_Black({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap',
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${business.name} — ${business.tagline}`,
    template: `%s — ${business.name}`,
  },
  description: business.description,
  applicationName: business.name,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '32x32' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: business.legalName,
    locale: 'hu_HU',
    url: siteUrl,
    title: `${business.name} — ${business.tagline}`,
    description: business.description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: business.tagline }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${business.name} — ${business.tagline}`,
    description: business.description,
    images: ['/og.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0E0D',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below adds a class to <html>
    // before React hydrates, so the server and client markup differ by design.
    <html lang="hu" className={`${inter.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Marks that JavaScript is running, which is what arms the scroll-reveal
          CSS. Without it every [data-reveal] element stays visible, so a no-JS
          render — or a crawler — sees the complete page.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js')` }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
