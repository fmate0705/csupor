/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Self-contained server build — required by the deploy Dockerfile.
  //
  // The standalone trace step creates symlinks, which Windows refuses without
  // Developer Mode or an elevated shell. Set NEXT_NO_STANDALONE=1 to verify a
  // production compile locally on Windows; the Docker build (Linux) always
  // leaves it on, so the shipped image is unaffected.
  output: process.env.NEXT_NO_STANDALONE === '1' ? undefined : 'standalone',
  // Don't advertise the framework version.
  poweredByHeader: false,

  // Content photography is pre-encoded to AVIF/WebP by `pnpm assets` and served
  // through a plain <picture>, so the built-in optimiser is not on the critical
  // path. These formats are still declared so anything added later via
  // next/image inherits the right defaults rather than falling back to JPEG.
  images: { formats: ['image/avif', 'image/webp'] },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // The site loads no third-party scripts, styles, fonts or frames, so
          // the policy can be strict. 'unsafe-inline' is required for styles
          // because Tailwind sets a few inline style attributes (aspect-ratio,
          // object-position) and Next injects inline <style> during streaming.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              // The Google Maps embed on the visit band is the only third-party
              // frame; without this it is silently blocked by default-src.
              'frame-src https://www.google.com',
              "img-src 'self' data:",
              "font-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              // Next's bootstrap and the reveal flag are inline scripts; the
              // hash-free fallback is required for the App Router runtime.
              "script-src 'self' 'unsafe-inline'" +
                (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
              "connect-src 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Pre-built, content-hashed by filename. Safe to cache hard.
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
