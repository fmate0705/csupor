import { business, footerLinks, navigation } from '@/content/business';
import { listBeersOnTap } from '@/lib/beers/store';
import { absoluteUrl } from '@/lib/site-url';

/**
 * llms.txt — a plain-text summary for AI answer engines.
 *
 * Generated rather than static: the checked-in file listed six routes that no
 * longer exist and described the brewery as "a professional hospitality
 * presence". Building it from the same constants the navigation uses means it
 * cannot go stale, and the tap list stays current because it reads the store.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const onTap = await listBeersOnTap();

  const hours = business.openingHours
    ? business.openingHours.map((row) => `${row.days}: ${row.hours}`).join('; ')
    : `${business.hoursFallback.value} — ${business.hoursFallback.help}`;

  const body = [
    `# ${business.legalName}`,
    '',
    `> ${business.description}`,
    '',
    '## Tények',
    `- Alapítva: ${business.foundedYear}`,
    `- Cím: ${business.address.full}, ${business.address.country}`,
    `- Telefon: ${business.phone.display}`,
    `- Nyitvatartás: ${hours}`,
    `- Árszint: ${business.priceRange.display}`,
    `- Adottságok: ${business.amenities.map((a) => a.label).join(', ')}`,
    `- Elismerések: ${business.awards.map((a) => `${a.title} (${a.year})`).join('; ')}`,
    '',
    '## Oldalak',
    ...[...navigation, ...footerLinks].map((page) => `- ${page.label}: ${absoluteUrl(page.href)}`),
    '',
    '## Jelenleg csapon',
    ...(onTap.length > 0
      ? onTap.map(
          (beer) => `- ${beer.name} — ${beer.style}${beer.abv !== null ? `, ${beer.abv}%` : ''}`,
        )
      : ['- A csapkínálat éppen cserélődik.']),
    '',
    'A sörválaszték rendszeresen változik; a fenti lista a lekérdezés pillanatában érvényes.',
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
