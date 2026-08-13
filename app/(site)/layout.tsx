import { Footer } from '@/components/site/footer';
import { MobileActionBar } from '@/components/site/mobile-action-bar';
import { Navbar } from '@/components/site/navbar';
import { jsonLdScript, localBusinessJsonLd } from '@/lib/seo/jsonld';

/**
 * Chrome for the public site. Kept out of the root layout so `/admin` renders
 * as a bare application shell.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* One Brewery/LocalBusiness node for the whole site; pages reference it
          by @id rather than repeating it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(localBusinessJsonLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Ugrás a tartalomra
      </a>
      <Navbar />
      {/* pb-14 clears the fixed mobile action bar; it is hidden from lg up. */}
      <main id="main" className="pb-14 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
