import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const browser = await chromium.launch({
  channel: process.env.DIFFSHOT_BROWSER_CHANNEL || undefined,
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto(pathToFileURL(resolve('dist/index.html')).href);
  await page.click('#mode-overlay');
  await page.locator('#slider').fill('48');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'assets/preview.png', fullPage: true });
  console.log('Saved assets/preview.png');
} finally {
  await browser.close();
}
