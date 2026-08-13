/**
 * End-to-end check of the admin panel against a running server.
 *
 * Exercises the real conversion path an operator uses: get blocked, log in,
 * add a beer, see it on the public page, take it off tap, see it move to the
 * "resting" list, delete it, and log out.
 *
 * Usage: node scripts/verify-admin.mjs [baseUrl] [user] [pass]
 */
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const USER = process.argv[3] ?? process.env.ADMIN_USERNAME;
const PASS = process.argv[4] ?? process.env.ADMIN_PASSWORD;

const BEER = `Teszt Sör ${Date.now().toString().slice(-5)}`;
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

try {
  // 1. Unauthenticated access must be redirected.
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check(
    'unauthenticated /admin redirects to login',
    page.url().includes('/admin/belepes'),
    page.url(),
  );

  // 2. Wrong password is rejected, without revealing which field was wrong.
  await page.fill('#username', USER);
  await page.fill('#password', 'definitely-the-wrong-password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(700);
  const errorText = (await page.textContent('form')) ?? '';
  check(
    'wrong password rejected with a non-enumerating message',
    errorText.includes('Hibás felhasználónév vagy jelszó'),
    errorText.trim().split('\n')[0]?.slice(0, 60),
  );

  // 3. Correct credentials log in.
  await page.fill('#username', USER);
  await page.fill('#password', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 15000 });
  check('valid credentials reach the panel', page.url().endsWith('/admin'));

  // 4. Session cookie is httpOnly.
  const cookie = (await context.cookies()).find((c) => c.name === 'csupor_session');
  check('session cookie is httpOnly', Boolean(cookie?.httpOnly), `sameSite=${cookie?.sameSite}`);

  // 5. Add a beer.
  await page.click('button:has-text("Új sör hozzáadása")');
  await page.fill('#new-name', BEER);
  await page.fill('#new-style', 'Teszt Pils');
  await page.fill('#new-abv', '4,2');
  await page.fill('#new-notes', 'Automatizált ellenőrzéshez létrehozott tétel.');
  await page.click('#new-beer-fields button[type="submit"]');
  await page.waitForTimeout(1200);
  check(
    'new beer appears in the admin list',
    (await page.textContent('body'))?.includes(BEER) ?? false,
  );

  // 6. It is live on the public page (revalidatePath worked).
  const pub = await context.newPage();
  await pub.goto(`${BASE}/sorok`, { waitUntil: 'networkidle' });
  const pubText = (await pub.textContent('body')) ?? '';
  check('new beer is live on /sorok', pubText.includes(BEER));
  check('ABV renders in Hungarian decimal form', pubText.includes('4,2%'));

  // 7. Take it off tap; it should move to the resting list.
  await page.reload({ waitUntil: 'networkidle' });
  const row = page.locator('li', { hasText: BEER }).first();
  await row.locator('button:has-text("Szerkeszt")').click();
  await page.waitForTimeout(300);
  await row.locator('input[name="onTap"]').uncheck();
  await row.locator('button[type="submit"]:has-text("Mentés")').click();
  await page.waitForTimeout(1200);

  await pub.reload({ waitUntil: 'networkidle' });
  const restingHeading = (await pub.textContent('body')) ?? '';
  check('off-tap beer moves to the resting section', restingHeading.includes('Épp pihen'));

  // 8. Delete it and confirm it leaves the public page.
  await page.reload({ waitUntil: 'networkidle' });
  const row2 = page.locator('li', { hasText: BEER }).first();
  await row2.locator('button:has-text("Törlés")').click();
  await row2.locator('button:has-text("Igen, törlöm")').click();

  // Wait for the row to actually disappear rather than guessing at a delay.
  let goneFromAdmin = false;
  try {
    await page
      .locator('li', { hasText: BEER })
      .first()
      .waitFor({ state: 'detached', timeout: 8000 });
    goneFromAdmin = true;
  } catch {
    goneFromAdmin = !((await page.textContent('body')) ?? '').includes(BEER);
  }
  check('beer removed from admin list without a manual reload', goneFromAdmin);

  await pub.reload({ waitUntil: 'networkidle' });
  check('beer removed from /sorok', !((await pub.textContent('body')) ?? '').includes(BEER));

  // 9. Log out, then confirm the panel is closed again.
  await page.click('button:has-text("Kilépés")');
  await page.waitForTimeout(900);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check('after logout /admin redirects to login', page.url().includes('/admin/belepes'));

  // 10. The admin surface must not be indexable.
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check(
    'robots.txt disallows /admin',
    robots.includes('/admin'),
    robots.replace(/\n/g, ' ').slice(0, 80),
  );
} catch (error) {
  check('run completed without an exception', false, String(error).slice(0, 200));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
// Set the code rather than calling process.exit(), which can abort while
// Playwright's handles are still closing and crash libuv on Windows.
process.exitCode = failed.length === 0 ? 0 : 1;
