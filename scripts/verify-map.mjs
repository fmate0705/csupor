/** Confirms the Google Maps embed is deferred, labelled and not CSP-blocked. */
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const cspViolations = [];
const googleRequests = [];
page.on('console', (msg) => {
  const t = msg.text();
  if (/Content Security Policy|Refused to frame/i.test(t)) cspViolations.push(t.slice(0, 160));
});
page.on('request', (req) => {
  if (req.url().includes('google.com')) googleRequests.push(req.url().slice(0, 60));
});

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

// Before scrolling: no frame, no contact with Google, address still shown.
check('no iframe before the band is reached', (await page.locator('iframe').count()) === 0);
check(
  'no Google request on load',
  googleRequests.length === 0,
  `${googleRequests.length} request(s)`,
);
check(
  'placeholder shows the address',
  ((await page.textContent('body')) ?? '').includes('3000 Hatvan, Csányi út'),
);

// Scroll to the visit band.
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise((r) => setTimeout(r, 4000));
});

const frame = page.locator('iframe[title]');
check('map mounts once scrolled into view', (await frame.count()) === 1);
check(
  'iframe has an accessible title',
  Boolean(await frame.getAttribute('title')),
  await frame.getAttribute('title'),
);
check('iframe is lazy-loaded', (await frame.getAttribute('loading')) === 'lazy');
check(
  'iframe sets a referrer policy',
  (await frame.getAttribute('referrerpolicy')) === 'strict-origin-when-cross-origin',
);
check(
  'map actually fetched from Google',
  googleRequests.length > 0,
  `${googleRequests.length} request(s)`,
);
check('no CSP violation', cspViolations.length === 0, cspViolations[0] ?? '');

const framePainted = await page
  .frameLocator('iframe[title]')
  .locator('body')
  .evaluate((b) => b.innerHTML.length > 200)
  .catch(() => false);
check('embed rendered content inside the frame', framePainted);

// The map is the visual half of the visit band, so every page carrying that
// band shows it — including the compact variant on /sorok.
const sorok = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await sorok.goto(`${BASE}/sorok`, { waitUntil: 'networkidle' });
check('compact band defers the map too', (await sorok.locator('iframe').count()) === 0);
await sorok.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise((r) => setTimeout(r, 3500));
});
check('compact band shows the map once reached', (await sorok.locator('iframe').count()) === 1);

// The map sits inside the page container, matching the terrace photograph on
// the home page — it must not bleed to the viewport edge.
const box = await page.locator('iframe[title]').boundingBox();
check(
  'map is inset from the viewport edge',
  Boolean(box && box.x >= 24 && box.x + box.width <= 1280 - 24),
  box ? `x=${Math.round(box.x)} right=${Math.round(box.x + box.width)}` : 'no box',
);
check(
  'map holds a 16:10 frame',
  Boolean(box && Math.abs(box.width / box.height - 1.6) < 0.05),
  box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'no box',
);

// It should be the same width as the terrace photograph above it: both sit in
// the 1.15fr column of the same grid, so they must agree within a pixel or two.
const terrace = await page.locator('img[src*="terasz-nappali"]').first().boundingBox();
check(
  'map matches the terrace photograph width',
  Boolean(box && terrace && Math.abs(box.width - terrace.width) <= 2),
  box && terrace ? `map ${Math.round(box.width)} vs photo ${Math.round(terrace.width)}` : 'missing',
);

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exitCode = failed === 0 ? 0 : 1;
