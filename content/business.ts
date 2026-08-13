/**
 * THE single source of truth for every piece of business information on this
 * site (brief §20). Address, phone, hours, socials and the navigation all come
 * from here — nothing is repeated in a component, a page, or the JSON-LD.
 *
 * To change the brewery's details, change them here and nowhere else.
 */

export const business = {
  name: 'Csupor Craft Beer',
  legalName: 'Csupor Craft Beer Sörfőzde',
  /** Used in <title> templates and the logo alt text. */
  shortName: 'Csupor',
  foundedYear: 2014,

  tagline: 'Kézműves sörfőzde, taproom és terasz Hatvanban',

  /**
   * One paragraph, reused by the footer, the OG description and the JSON-LD.
   * Every claim here is verifiable from the brief or the brewery's own site.
   */
  description:
    'Kézműves sörfőzde Hatvanban, 2014 óta. Saját főzésű söreinket ott csapoljuk, ahol készülnek — a főzde melletti taproomban és a régi benzinkútból lett teraszon.',

  address: {
    street: 'Csányi út',
    city: 'Hatvan',
    postalCode: '3000',
    country: 'Magyarország',
    countryCode: 'HU',
    /** Written out the way a person would say it. */
    full: '3000 Hatvan, Csányi út',
    /** Landmark that actually helps people find it — the site is a former petrol station. */
    landmark: 'a régi benzinkút a Csányi úton',
  },

  maps: {
    /** Verified from the brewery's own Google Maps place entry. */
    latitude: 47.6625075,
    longitude: 19.7161356,
    /** Google place identifier, from the same entry. */
    placeId: '0x47404db7c6f70011:0x8fb14f1c6b4c0828',
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=' +
      encodeURIComponent('Csupor Craft Beer Sörfőzde, 3000 Hatvan, Csányi út'),
    placeUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('Csupor Craft Beer Sörfőzde, 3000 Hatvan, Csányi út'),
    /**
     * Google Maps embed URL. Third-party content: it is lazy-loaded so it costs
     * nothing until the reader scrolls to it, and the imprint page discloses it.
     */
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2687.128115758439!2d19.716135599999998!3d47.6625075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47404db7c6f70011%3A0x8fb14f1c6b4c0828!2sCsupor%20Craft%20Beer%20S%C3%B6rf%C5%91zde!5e0!3m2!1shu!2shu!4v1786222052429!5m2!1shu!2shu',
  },

  phone: {
    display: '+36 70 356 9586',
    /** E.164, for tel: links and structured data. */
    e164: '+36703569586',
  },

  social: {
    instagram: 'https://www.instagram.com/csupor_craft_beer/',
    facebook: 'https://facebook.com/csuporsor',
  },

  /**
   * Opening hours are NOT published anywhere we can verify, and the taproom is
   * seasonal. Rather than invent a schedule — which would send people to a
   * closed door and would be a fabricated fact under CEF Article IV — this is
   * left null and the UI falls back to "call us", which is true.
   *
   * To publish real hours, replace `null` with an array like:
   *   [{ days: 'Csütörtök – Péntek', hours: '16:00 – 22:00' },
   *    { days: 'Szombat',            hours: '14:00 – 22:00' }]
   * The visit page, the footer and the LocalBusiness JSON-LD all pick it up
   * automatically. For the JSON-LD to emit machine-readable hours, also fill in
   * `openingHoursSpec` below.
   */
  openingHours: null as ReadonlyArray<{ days: string; hours: string }> | null,

  /**
   * Schema.org openingHoursSpecification. Kept separate from the human-readable
   * list because the two formats differ. Leave empty while hours are unknown.
   * Example: [{ dayOfWeek: ['Friday'], opens: '16:00', closes: '22:00' }]
   */
  openingHoursSpec: [] as ReadonlyArray<{
    dayOfWeek: readonly string[];
    opens: string;
    closes: string;
  }>,

  /** Copy shown wherever hours would go while `openingHours` is null. */
  hoursFallback: {
    label: 'Nyitvatartás',
    value: 'Szezonálisan változik',
    help: 'Hívj minket, és megmondjuk, mikor csapolunk.',
  },

  priceRange: {
    /** Schema.org priceRange notation. */
    schema: '$$',
    display: '2 000 – 4 000 Ft / fő',
  },

  /** Facts stated in the brief. Rendered as the amenity list on the visit page. */
  amenities: [
    { label: 'Kutyabarát', detail: 'A négylábúak is jöhetnek.' },
    { label: 'Terasz', detail: 'Kültéri ülőhelyek a régi kútbeálló alatt.' },
    { label: 'Sörkóstolás', detail: 'Végigkóstolható a csapon lévő választék.' },
    { label: 'Helyben főzve', detail: 'A főzde ugyanabban az épületben van.' },
  ],

  /**
   * Only awards we can source. The 2016 title comes from the brief and the
   * brewery's own site; the 2015 Altech bronze from the brewery's own site.
   */
  awards: [
    {
      year: 2016,
      title: 'Magyarország legjobb söre',
      detail: 'A főzde egyik söre kapta az év magyar söre elismerést.',
    },
    {
      year: 2015,
      title: 'Altech bronzérem',
      detail: 'Nemzetközi elismerés az írországi Altech versenyen.',
    },
  ],
} as const;

/** Main navigation. Four pages — the legal page is footer-only by design. */
export const navigation = [
  { href: '/', label: 'Kezdőlap' },
  { href: '/sorok', label: 'Söreink' },
  { href: '/sorfozde', label: 'A sörfőzde' },
  { href: '/latogatas', label: 'Látogatás' },
] as const;

export const footerLinks = [{ href: '/impresszum', label: 'Impresszum és adatkezelés' }] as const;

export type Business = typeof business;
