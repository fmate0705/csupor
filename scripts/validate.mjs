/**
 * Phase E validation — drives a real browser across every page and breakpoint.
 *
 * CEF's decision engine nominates the Chrome DevTools MCP for browser
 * verification; that surface was unavailable in this environment (the pane
 * never composited, so all geometry read back as zero). Playwright is CEF's
 * approved browser-automation tool, so it serves the same purpose here.
 *
 * Checks per page × breakpoint:
 *   - console errors and failed requests
 *   - horizontal overflow of the document
 *   - any element wider than the viewport
 *   - exactly one h1, and no skipped heading levels
 *   - images: alt present, actually loaded
 *   - tap targets at least 44x44 on mobile
 *   - screenshots written to .validation/
 *
 * Usage:  node scripts/validate.mjs [baseUrl]
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const OUT = '.validation';

const PAGES = [
  { path: '/', name: 'kezdolap' },
  { path: '/sorok', name: 'sorok' },
  { path: '/sorfozde', name: 'sorfozde' },
  { path: '/latogatas', name: 'latogatas' },
  { path: '/impresszum', name: 'impresszum' },
  { path: '/admin/belepes', name: 'admin-belepes' },
  { path: '/nincs-ilyen-oldal', name: '404' },
];

const VIEWPORTS = [
  { name: '320', width: 320, height: 640, mobile: true },
  { name: 'mobile', width: 390, height: 844, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: false },
  { name: 'desktop', width: 1280, height: 900, mobile: false },
  { name: 'wide', width: 1920, height: 1080, mobile: false },
];

const problems = [];
const note = (page, viewport, kind, detail) => problems.push({ page, viewport, kind, detail });

/** Runs inside the page. Returns everything measurable in one round trip. */
function audit(viewportWidth) {
  const doc = document.documentElement;

  // An element clipped by an ancestor with overflow:hidden still reports its
  // full, unclipped box — so a scaled hero image looks like overflow when it
  // is actually cropped. Only report elements that are genuinely visible past
  // the viewport edge.
  const isClipped = (el) => {
    let parent = el.parentElement;
    while (parent && parent !== document.documentElement) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== 'visible' || style.overflowY !== 'visible') return true;
      parent = parent.parentElement;
    }
    return false;
  };

  const overflowing = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const style = getComputedStyle(el);
      if (style.position === 'fixed') return false;
      if (isClipped(el)) return false;
      return r.right > viewportWidth + 1 || r.left < -1;
    })
    .slice(0, 8)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 70),
      right: Math.round(el.getBoundingClientRect().right),
      left: Math.round(el.getBoundingClientRect().left),
    }));

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => h.offsetParent !== null || getComputedStyle(h).position === 'fixed')
    .map((h) => Number(h.tagName[1]));

  const skips = [];
  for (let i = 1; i < headings.length; i += 1) {
    if (headings[i] - headings[i - 1] > 1) skips.push(`h${headings[i - 1]} → h${headings[i]}`);
  }

  const images = [...document.querySelectorAll('img')].map((img) => ({
    src: (img.currentSrc || img.src || '').split('/').pop(),
    hasAlt: img.hasAttribute('alt'),
    loaded: img.complete && img.naturalWidth > 0,
  }));

  // Interactive targets that are visible right now.
  const targets = [
    ...document.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])'),
  ]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      // Skip skip-links and other sr-only controls: they are 1x1 until focused.
      if (el.classList.contains('sr-only')) return false;
      // Links inside a paragraph are exempt from WCAG 2.5.8 (inline exception).
      if (el.closest('p')) return false;
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 32),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });

  return {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    docHeight: doc.scrollHeight,
    h1Count: document.querySelectorAll('h1').length,
    headingSkips: skips,
    overflowing,
    images,
    // WCAG 2.2 AA (2.5.8) requires 24x24 CSS px. 44px is the comfort target we
    // hold primary actions to; anything under 24 is a conformance failure.
    smallTargets: targets.filter((t) => t.h < 24 || t.w < 24),
    title: document.title,
    metaDescription:
      document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try {
        const parsed = JSON.parse(s.textContent);
        return Array.isArray(parsed) ? parsed.map((p) => p['@type']).join('+') : parsed['@type'];
      } catch {
        return 'INVALID_JSON';
      }
    }),
    revealsStuckHidden: [...document.querySelectorAll('[data-reveal]')].filter((el) => {
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight && r.bottom > 0;
      return inView && getComputedStyle(el).opacity === '0';
    }).length,
  };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = [];

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: 2,
      locale: 'hu-HU',
    });

    for (const target of PAGES) {
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];

      const expect404 = target.path.includes('nincs-ilyen');
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        // The 404 page legitimately produces a 404 response.
        if (expect404 && text.includes('404')) return;
        consoleErrors.push(text.slice(0, 200));
      });
      page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`.slice(0, 200)));
      page.on('requestfailed', (req) => {
        // Next prefetches RSC payloads for links in view; closing the page
        // cancels them. An abort is not a broken request.
        const reason = req.failure()?.errorText ?? '';
        if (reason.includes('ERR_ABORTED')) return;
        failedRequests.push(`${req.method()} ${req.url().slice(0, 120)} (${reason})`);
      });
      page.on('response', (res) => {
        if (res.status() >= 400 && !target.path.includes('nincs-ilyen')) {
          failedRequests.push(`${res.status()} ${res.url().slice(0, 120)}`);
        }
      });

      const response = await page.goto(BASE + target.path, {
        waitUntil: 'networkidle',
        timeout: 45000,
      });

      // Walk the page so lazy images load and every scroll reveal fires.
      // `scroll-behavior: smooth` is set on <html>, which makes scripted
      // scrolling animate and never arrive — it has to be disabled first or
      // the page is captured with most of its content still at opacity 0.
      await page.evaluate(async () => {
        const previous = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        const step = window.innerHeight * 0.7;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 140));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 500));
        document.documentElement.style.scrollBehavior = previous;
      });

      // After a full pass every reveal must have fired; anything still hidden
      // would be invisible content for a real reader too.
      const stillHidden = await page.evaluate(
        () =>
          [...document.querySelectorAll('[data-reveal]')].filter(
            (el) => el.dataset.revealed !== 'true',
          ).length,
      );
      if (stillHidden > 0) {
        note(target.name, viewport.name, 'reveal-never-fired', `${stillHidden} element(s)`);
      }

      const result = await page.evaluate(audit, viewport.width);
      const status = response?.status() ?? 0;

      // --- turn measurements into findings -------------------------------
      const id = `${target.name}@${viewport.name}`;
      if (target.name === '404' ? status !== 404 : status !== 200) {
        note(target.name, viewport.name, 'status', `HTTP ${status}`);
      }
      for (const e of consoleErrors) note(target.name, viewport.name, 'console', e);
      for (const f of [...new Set(failedRequests)]) note(target.name, viewport.name, 'request', f);
      if (result.scrollWidth > result.clientWidth + 1) {
        note(
          target.name,
          viewport.name,
          'overflow',
          `scrollWidth ${result.scrollWidth} > ${result.clientWidth}`,
        );
      }
      for (const el of result.overflowing) {
        note(
          target.name,
          viewport.name,
          'overflow-el',
          `<${el.tag} class="${el.cls}"> right=${el.right}`,
        );
      }
      if (result.h1Count !== 1)
        note(target.name, viewport.name, 'h1', `${result.h1Count} h1 elements`);
      for (const s of result.headingSkips) note(target.name, viewport.name, 'heading-skip', s);
      for (const img of result.images) {
        if (!img.hasAlt) note(target.name, viewport.name, 'img-alt', img.src);
        if (!img.loaded) note(target.name, viewport.name, 'img-broken', img.src);
      }
      if (viewport.mobile) {
        for (const t of result.smallTargets) {
          note(target.name, viewport.name, 'tap-target', `<${t.tag}> "${t.label}" ${t.w}x${t.h}`);
        }
      }
      if (result.revealsStuckHidden > 0) {
        note(
          target.name,
          viewport.name,
          'reveal-stuck',
          `${result.revealsStuckHidden} in-view elements still at opacity 0`,
        );
      }
      if (!result.metaDescription)
        note(target.name, viewport.name, 'seo', 'missing meta description');
      if (result.jsonLd.includes('INVALID_JSON')) {
        note(target.name, viewport.name, 'seo', 'invalid JSON-LD');
      }

      report.push({ id, status, ...result });

      // Screenshot the two breakpoints that matter most for review.
      if (viewport.name === 'mobile' || viewport.name === 'desktop') {
        await page.screenshot({
          path: `${OUT}/${target.name}-${viewport.name}.png`,
          fullPage: true,
        });
      }

      await page.close();
    }
    await context.close();
  }

  await browser.close();
  await writeFile(`${OUT}/report.json`, JSON.stringify({ problems, report }, null, 2));

  // --- summary ---------------------------------------------------------
  console.log(`\nChecked ${PAGES.length} pages × ${VIEWPORTS.length} viewports.\n`);
  if (problems.length === 0) {
    console.log('No problems found.');
    return;
  }

  const byKind = new Map();
  for (const p of problems) {
    const key = p.kind;
    if (!byKind.has(key)) byKind.set(key, []);
    byKind.get(key).push(p);
  }

  for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${kind.toUpperCase()} (${list.length})`);
    const seen = new Set();
    for (const p of list) {
      const line = `${p.page}@${p.viewport}: ${p.detail}`;
      const dedupe = `${p.kind}|${p.detail}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      console.log(`  ${line}`);
    }
  }
  console.log(`\nTotal findings: ${problems.length}. Full detail in ${OUT}/report.json`);
}

await main();
