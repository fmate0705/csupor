import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin panel is the only non-public surface. It is already gated by
      // middleware and marked noindex; this keeps it out of crawl budget too.
      disallow: ['/admin'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
