import type { MetadataRoute } from 'next';

import { business } from '@/content/business';

/**
 * Web app manifest, generated from the business record rather than kept as a
 * static file — the hand-written one shipped the project slug as the app name,
 * the framework's default blue as the theme colour, and an icon path that did
 * not exist.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: business.legalName,
    short_name: business.name,
    description: business.description,
    lang: 'hu',
    start_url: '/',
    display: 'standalone',
    background_color: '#0E0E0D',
    theme_color: '#0E0E0D',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
