import test from 'node:test';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
import { comparePng } from '../src/diff.mjs';
import { parseArgs, joinPath, displayUrl } from '../src/options.mjs';
import { messages } from '../src/i18n.mjs';
import { makeReport } from '../src/report.mjs';

const png = (width, height, color = [255, 255, 255, 255]) => {
  const p = new PNG({ width, height });
  for (let i = 0; i < p.data.length; i += 4) p.data.set(color, i);
  return PNG.sync.write(p);
};
test('added or removed white area counts, while identical pixels do not', () => {
  assert.equal(comparePng(png(4, 3), png(4, 3)).changedPixels, 0);
  for (const [a, b] of [
    [png(4, 3), png(4, 5)],
    [png(4, 5), png(4, 3)],
  ]) {
    const diff = comparePng(a, b);
    assert.equal(diff.changedPixels, 8);
    assert.equal(diff.resizedPixels, 8);
    assert.equal(diff.ratio, 0.4);
  }
  assert.equal(comparePng(png(4, 4), png(4, 4, [0, 0, 0, 255])).changedPixels, 16);
});
test('URL and option boundaries do not permit scheme switching or credential URLs', () => {
  for (const url of ['file:///etc/passwd', 'javascript:alert(1)', 'https://user:pass@example.com'])
    assert.throws(() => parseArgs([url, 'https://example.com']));
  for (const path of ['//evil.example/', '/\\evil.example/', 'https://evil.example/'])
    assert.throws(() => joinPath('https://good.example', path));
  const args = ['http://127.0.0.1:3000/a', 'http://127.0.0.1:4000/b'];
  assert.equal(parseArgs(args).paths.length, 0);
  assert.equal(parseArgs([...args, '--lang', 'ja', '--delay', '0']).lang, 'ja');
  assert.throws(() => parseArgs([...args, '--timeout', 'Infinity']));
  assert.throws(() => parseArgs([...args, ...Array(6).fill(['--path', '/a']).flat()]));
  assert.equal(
    displayUrl('https://example.com/a?token=secret#private'),
    'https://example.com/a?[redacted]',
  );
});
test('all user messages have five translations and report payload cannot close a script', () => {
  for (const [key, values] of Object.entries(messages)) {
    assert.equal(values.length, 5, key);
    assert(
      values.every((value) => typeof value === 'string' && value.length),
      key,
    );
  }
  const attack = '</script><img src=x onerror=alert(1)>';
  const html = makeReport({ before: attack, after: attack, cases: [], language: 'en' });
  assert(!html.includes(attack));
  assert(html.includes('\\u003c/script\\u003e'));
  assert(html.includes("default-src 'none'"));
  assert(!html.includes("'unsafe-inline'"));
});
