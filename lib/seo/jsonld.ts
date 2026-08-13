import { business } from '@/content/business';
import { absoluteUrl, siteUrl } from '@/lib/site-url';

/**
 * Structured data, built entirely from `content/business.ts`.
 *
 * Nothing here is hand-typed a second time, so the markup cannot drift from
 * what the page says. Fields we cannot verify are still omitted rather than
 * guessed — `openingHours` stays absent until real hours are configured,
 * because sending people to a closed door is worse than saying nothing.
 */

const sameAs = [business.social.instagram, business.social.facebook];

/**
 * `Brewery` is the precise schema.org type for this business and inherits from
 * FoodEstablishment → LocalBusiness, so it satisfies both the brewery and the
 * local-business intent in one node (brief §16).
 */
export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Brewery',
  '@id': `${siteUrl}/#brewery`,
  name: business.legalName,
  alternateName: business.name,
  url: siteUrl,
  description: business.description,
  image: absoluteUrl('/og.jpg'),
  logo: absoluteUrl('/logo-ink.png'),
  telephone: business.phone.e164,
  foundingDate: String(business.foundedYear),
  priceRange: business.priceRange.schema,
  currenciesAccepted: 'HUF',
  servesCuisine: 'Kézműves sör',
  hasMenu: absoluteUrl('/sorok'),
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    postalCode: business.address.postalCode,
    addressCountry: business.address.countryCode,
  },
  // Verified from the brewery's Google Maps place entry, so local search and
  // "directions" surfaces resolve to the right pin.
  geo: {
    '@type': 'GeoCoordinates',
    latitude: business.maps.latitude,
    longitude: business.maps.longitude,
  },
  sameAs,
  hasMap: business.maps.placeUrl,
  // Only emitted once real hours are configured; an empty array is dropped.
  ...(business.openingHoursSpec.length > 0
    ? {
        openingHoursSpecification: business.openingHoursSpec.map((spec) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: spec.dayOfWeek,
          opens: spec.opens,
          closes: spec.closes,
        })),
      }
    : {}),
  amenityFeature: business.amenities.map((amenity) => ({
    '@type': 'LocationFeatureSpecification',
    name: amenity.label,
    value: true,
  })),
  award: business.awards.map((award) => `${award.title} (${award.year})`),
} as const;

/** Kept for the site-wide publisher reference in per-page graphs. */
export const organizationJsonLd = localBusinessJsonLd;

export function webPageJsonLd({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: 'hu-HU',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: business.legalName,
      url: siteUrl,
    },
    about: { '@id': `${siteUrl}/#brewery` },
  };
}

export function breadcrumbJsonLd(trail: ReadonlyArray<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * The tap list as a schema.org Menu. Beers carry a name, style and ABV but no
 * price — we have no verified per-beer pricing, so `offers` is omitted rather
 * than fabricated.
 */
export function tapListJsonLd(
  beers: ReadonlyArray<{ name: string; style: string; abv: number | null; notes: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${absoluteUrl('/sorok')}#menu`,
    name: 'Söreink',
    inLanguage: 'hu-HU',
    provider: { '@id': `${siteUrl}/#brewery` },
    hasMenuSection: {
      '@type': 'MenuSection',
      name: 'Csapon',
      hasMenuItem: beers.map((beer) => ({
        '@type': 'MenuItem',
        name: beer.name,
        description: [beer.style, beer.notes].filter(Boolean).join(' — '),
        ...(beer.abv !== null
          ? {
              nutrition: {
                '@type': 'NutritionInformation',
                alcoholContent: `${beer.abv}%`,
              },
            }
          : {}),
      })),
    },
  };
}

/** Serialises a JSON-LD node for a <script> tag, escaping the `<` that could close it. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
