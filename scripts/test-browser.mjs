import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { startFixture } from '../examples/fixture.mjs';
import { collect } from '../src/capture.mjs';
import { parseArgs } from '../src/options.mjs';
import { makeReport } from '../src/report.mjs';

await mkdir('test-results', { recursive: true });
const work = await mkdtemp(resolve('test-results/run-'));
const fixture = await startFixture();
async function cli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['src/cli.mjs', ...args], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', reject);
    child.on('close', (status) => resolve({ status, output }));
  });
}
let browser;
try {
  const identical = await collect(parseArgs([fixture.url + '/before', fixture.url + '/before']));
  assert(identical.cases.every((row) => row.status === 'same'));
  const changed = await collect(
    parseArgs([fixture.url + '/before', fixture.url + '/after', '--ready', '#ready']),
  );
  assert(changed.cases.every((row) => row.status === 'changed'));
  assert(changed.cases[2].before.overflow);
  assert(!changed.cases[2].after.overflow);
  assert(changed.cases.some((row) => row.diff.resizedPixels > 0));
  const failed = await collect(
    parseArgs([fixture.url + '/before', fixture.url + '/missing?token=FAKE_DO_NOT_LEAK']),
  );
  assert(failed.cases.every((row) => row.status === 'error' && row.after.httpStatus === 404));
  assert(!JSON.stringify(failed).includes('FAKE_DO_NOT_LEAK'));
  const masked = await collect(
    parseArgs([fixture.url + '/before', fixture.url + '/before', '--mask', '#ready']),
  );
  assert(masked.cases.every((row) => row.status === 'same'));
  const maskPng = PNG.sync.read(Buffer.from(masked.cases[0].before.image, 'base64'));
  assert.deepEqual(
    [...maskPng.data.slice((200 * maskPng.width + 200) * 4, (200 * maskPng.width + 200) * 4 + 4)],
    [98, 115, 130, 255],
  );
  const invalidMask = await collect(
    parseArgs([fixture.url + '/before', fixture.url + '/before', '--mask', '.does-not-exist']),
  );
  assert(invalidMask.cases.every((row) => row.before.error === 'mask'));

  const cliArgs = [
    fixture.url + '/before',
    fixture.url + '/before',
    '--lang',
    'ko',
    '--out',
    resolve(work, 'cli'),
  ];
  const success = await cli(cliArgs);
  assert.equal(success.status, 0, success.output);
  assert(success.output.includes('보고서 저장 완료'));
  const originalReport = await readFile(resolve(work, 'cli/index.html'));
  const existing = await cli(cliArgs);
  assert.equal(existing.status, 2);
  assert((await readFile(resolve(work, 'cli/index.html'))).equals(originalReport));
  const failure = await cli([
    fixture.url + '/before',
    fixture.url + '/missing',
    '--out',
    resolve(work, 'failure'),
  ]);
  assert.equal(failure.status, 1);
  const json = JSON.parse(await readFile(resolve(work, 'failure/report.json'), 'utf8'));
  assert(json.cases.every((row) => row.status === 'error'));
  assert(!JSON.stringify(json).includes('"image"'));

  changed.cases[0].before.title = '</script><img src=x onerror="window.injected=true">';
  changed.cases.push(failed.cases[0]);
  const html = makeReport(changed);
  await writeFile(resolve(work, 'report.html'), html);
  browser = await chromium.launch({ channel: process.env.DIFFSHOT_BROWSER_CHANNEL || undefined });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [],
    external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) external.push(request.url());
  });
  await page.goto(pathToFileURL(resolve(work, 'report.html')).href);
  assert.equal(await page.locator('.case').count(), 4);
  assert.equal(await page.evaluate(() => window.injected), undefined);
  await page.click('#mode-overlay');
  await page.locator('#slider').fill('25');
  assert.equal(Number(await page.locator('#clip').getAttribute('width')), 360);
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.click('#mode-difference');
  assert(await page.locator('#diff-image').isVisible());
  const download = page.waitForEvent('download');
  await page.click('#download-diff');
  await (await download).saveAs(resolve(work, 'download.png'));
  assert(
    (await readFile(resolve(work, 'download.png'))).equals(
      Buffer.from(changed.cases[0].diff.image, 'base64'),
    ),
  );
  const locales = [
    ['en', 'Side by side'],
    ['ko', '나란히'],
    ['zh-CN', '并排'],
    ['ja', '左右比較'],
    ['es', 'En paralelo'],
  ];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [lang, label] of locales) {
    await page.selectOption('#language', lang);
    assert.equal(await page.locator('#mode-compare').textContent(), label);
    assert.equal(await page.locator('html').getAttribute('lang'), lang);
    assert(
      !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)),
      `${lang} overflow`,
    );
  }
  await page.locator('.case').nth(2).click();
  await page.click('#mode-compare');
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  await page.locator('.case').nth(3).click();
  assert(await page.locator('#failure').isVisible());
  assert(await page.locator('#downloads').isHidden());
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  const receipt = {
    identical: true,
    changed: true,
    resizedArea: true,
    httpFailure: true,
    mask: true,
    missingMaskFails: true,
    embeddedPayloadEscaped: true,
    offline: true,
    externalRequests: 0,
    languages: locales.map(([lang]) => lang),
    mobileOverflow: false,
    download: true,
  };
  await writeFile('test-results/verification.json', JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
} finally {
  await browser?.close();
  await fixture.close();
}
