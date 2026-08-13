import type { MetadataRoute } from 'next';

import { footerLinks, navigation } from '@/content/business';
import { absoluteUrl } from '@/lib/site-url';

/**
 * Built from the same navigation constant the header and footer use, so a new
 * page can never be added to the site and forgotten here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const priorities: Record<string, number> = {
    '/': 1,
    '/sorok': 0.9,
    '/latogatas': 0.9,
    '/sorfozde': 0.7,
  };

  return [
    ...navigation.map((page) => ({
      url: absoluteUrl(page.href),
      lastModified: now,
      changeFrequency: (page.href === '/sorok' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: priorities[page.href] ?? 0.6,
    })),
    ...footerLinks.map((page) => ({
      url: absoluteUrl(page.href),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ];
}
