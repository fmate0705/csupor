/**
 * End-to-end check of the open/closed card.
 *
 * Drives the path the brewery actually uses: log in, set a state, and confirm
 * the home page reflects it. Covers all three states, because "hidden" is the
 * one that keeps an unverified claim off the front page.
 *
 * Usage: node scripts/verify-status.mjs [baseUrl] [user] [pass]
 */
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const USER = process.argv[3] ?? process.env.ADMIN_USERNAME;
const PASS = process.argv[4] ?? process.env.ADMIN_PASSWORD;

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const admin = await context.newPage();
const site = await context.newPage();

/** Picks a state in the admin form, optionally sets the note, and saves. */
async function setState(mode, note) {
  await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await admin.check(`input[name="mode"][value="${mode}"]`);
  await admin.fill('#status-note', note ?? '');
  await admin.click('form:has(#status-note) button[type="submit"]');
  await admin.waitForTimeout(1200);
}

async function heroCard() {
  await site.goto(BASE, { waitUntil: 'networkidle' });
  const el = site.locator('[data-open-status]');
  if ((await el.count()) === 0) return null;
  return {
    mode: await el.getAttribute('data-open-status'),
    text: (await el.innerText()).replace(/\s+/g, ' ').trim(),
  };
}

try {
  await admin.goto(`${BASE}/admin/belepes`, { waitUntil: 'networkidle' });
  await admin.fill('#username', USER);
  await admin.fill('#password', PASS);
  await admin.click('button[type="submit"]');
  await admin.waitForURL('**/admin', { timeout: 15000 });
  check('admin reachable', admin.url().endsWith('/admin'));

  // --- open -------------------------------------------------------------
  await setState('open', 'Ma 23:00-ig csapolunk.');
  let card = await heroCard();
  check('open: card appears on the home page', card?.mode === 'open', card?.text);
  check('open: the note is shown', (card?.text ?? '').includes('Ma 23:00-ig csapolunk.'));
  check('open: says nyitva, not zárva', (card?.text ?? '').toLowerCase().includes('most nyitva'));

  // --- closed with a reason --------------------------------------------
  await setState('closed', 'A Főzdefeszten vagyunk Egerben.');
  card = await heroCard();
  check('closed: card flips state', card?.mode === 'closed', card?.text);
  check('closed: the reason is shown', (card?.text ?? '').includes('Egerben'));

  // --- hidden -----------------------------------------------------------
  await setState('hidden', 'ezt el kell dobni');
  card = await heroCard();
  check('hidden: no card on the home page', card === null);

  // The note must not survive a hide, or a stale festival message would
  // reappear the next time the card is switched on.
  await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  const noteValue = await admin.inputValue('#status-note');
  check('hidden: the note was discarded', noteValue === '', `note="${noteValue}"`);

  // --- unauthenticated writes are refused -------------------------------
  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check('unauthenticated /admin redirects to login', anonPage.url().includes('/admin/belepes'));
  await anon.close();
} catch (error) {
  check('run completed without an exception', false, String(error).slice(0, 200));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exitCode = failed === 0 ? 0 : 1;
