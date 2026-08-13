/**
 * Proves the beer list survives a container restart.
 *
 * This is the one thing the volume exists for: if an edit is lost on redeploy,
 * the admin panel is worse than useless because the operator would trust it.
 *
 * Usage: node scripts/verify-persistence.mjs <baseUrl> <container> <user> <pass>
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const [, , BASE, CONTAINER, USER, PASS] = process.argv;
const BEER = `Perzisztencia ${Date.now().toString().slice(-5)}`;

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
let ok = true;

try {
  await page.goto(`${BASE}/admin/belepes`, { waitUntil: 'networkidle' });
  await page.fill('#username', USER);
  await page.fill('#password', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 15000 });

  await page.click('button:has-text("Új sör hozzáadása")');
  await page.fill('#new-name', BEER);
  await page.fill('#new-style', 'Restart teszt');
  await page.fill('#new-abv', '5');
  await page.click('#new-beer-fields button[type="submit"]');
  await page.locator('li', { hasText: BEER }).first().waitFor({ timeout: 10000 });
  console.log(`PASS  created "${BEER}"`);

  console.log(`      restarting container ${CONTAINER}…`);
  execFileSync('docker', ['restart', CONTAINER], { stdio: 'ignore' });

  // Wait for the app to answer again.
  let up = false;
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) {
        up = true;
        break;
      }
    } catch {
      /* still starting */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!up) throw new Error('container did not come back healthy');
  console.log('PASS  container healthy after restart');

  const after = await context.newPage();
  await after.goto(`${BASE}/sorok`, { waitUntil: 'networkidle' });
  const survived = ((await after.textContent('body')) ?? '').includes(BEER);
  console.log(`${survived ? 'PASS' : 'FAIL'}  beer survived the restart`);
  ok = ok && survived;

  // Clean up so the volume is not left with test data.
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  const row = page.locator('li', { hasText: BEER }).first();
  await row.locator('button:has-text("Törlés")').click();
  await row.locator('button:has-text("Igen, törlöm")').click();
  await row.waitFor({ state: 'detached', timeout: 8000 });
  console.log('PASS  test data cleaned up');
} catch (error) {
  console.log(`FAIL  ${String(error).slice(0, 200)}`);
  ok = false;
} finally {
  await browser.close();
}

process.exitCode = ok ? 0 : 1;
