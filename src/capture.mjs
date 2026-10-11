import { chromium } from 'playwright';
import { viewports, joinPath, displayUrl } from './options.mjs';
import { comparePng } from './diff.mjs';

async function capture(browser, url, viewport, options) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    acceptDownloads: false,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(options.timeout);
  let code = 'navigation';
  try {
    const response = await page.goto(url, { waitUntil: 'load', timeout: options.timeout });
    if (!response || !response.ok())
      return { error: 'http', httpStatus: response?.status() ?? 0, url: displayUrl(url) };
    code = 'ready';
    if (options.ready) await page.locator(options.ready).first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, {
      timeout: options.timeout,
    });
    if (options.delay) await page.waitForTimeout(options.delay);
    code = 'mask';
    const mask = [];
    for (const selector of options.masks) {
      const locator = page.locator(selector);
      if (!(await locator.count())) throw new Error('Missing mask');
      mask.push(locator);
    }
    const { width, height } = await page.evaluate(() => ({
      width: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
      height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
    }));
    if (height > 8000) return { error: 'pageSize', url: displayUrl(url) };
    code = 'screenshot';
    const image = await page.screenshot({
      type: 'png',
      fullPage: true,
      clip: { x: 0, y: 0, width: viewport.width, height },
      animations: 'disabled',
      caret: 'hide',
      mask,
      maskColor: '#627382',
      timeout: options.timeout,
    });
    return {
      url: displayUrl(url),
      title: (await page.title()).slice(0, 200),
      width: viewport.width,
      height,
      documentWidth: width,
      overflow: width > viewport.width,
      image: image.toString('base64'),
    };
  } catch {
    // Do not serialize browser error stacks: they can contain query tokens or page content.
    return { error: code, url: displayUrl(url) };
  } finally {
    await context.close();
  }
}

export async function collect(options, progress = () => {}) {
  const browser = await chromium.launch({
    channel: process.env.DIFFSHOT_BROWSER_CHANNEL || undefined,
  });
  const cases = [];
  try {
    const paths = options.paths.length ? options.paths : [null];
    for (let p = 0; p < paths.length; p++)
      for (const viewport of viewports) {
        const beforeUrl = paths[p] === null ? options.before : joinPath(options.before, paths[p]);
        const afterUrl = paths[p] === null ? options.after : joinPath(options.after, paths[p]);
        const before = await capture(browser, beforeUrl, viewport, options);
        const after = await capture(browser, afterUrl, viewport, options);
        const row = {
          id: `${p + 1}-${viewport.name}`,
          path: paths[p]?.split(/[?#]/)[0] ?? '/',
          viewport,
          before,
          after,
          status: 'error',
        };
        if (!before.error && !after.error) {
          const diff = comparePng(
            Buffer.from(before.image, 'base64'),
            Buffer.from(after.image, 'base64'),
          );
          row.diff = { ...diff, image: diff.image.toString('base64') };
          row.status = diff.changedPixels ? 'changed' : 'same';
        }
        cases.push(row);
        progress(row, cases.length, paths.length * viewports.length);
      }
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      language: options.lang,
      before: displayUrl(options.before),
      after: displayUrl(options.after),
      settings: {
        browser: 'Chromium',
        locale: 'en-US',
        timezone: 'UTC',
        colorScheme: 'light',
        threshold: 0.1,
        includeAA: false,
        maxHeight: 8000,
        delay: options.delay,
        maskedSelectors: options.masks.length,
        readySelector: Boolean(options.ready),
      },
      cases,
    };
  } finally {
    await browser.close();
  }
}
