#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { parseArgs, languages } from './options.mjs';
import { collect } from './capture.mjs';
import { makeReport } from './report.mjs';
import { t } from './i18n.mjs';

const args = process.argv.slice(2);
const requested = args[args.indexOf('--lang') + 1];
let lang = languages.includes(requested) ? requested : 'en';
try {
  const options = parseArgs(args);
  lang = options.lang;
  if (options.help) {
    console.log(
      `Diffshot 0.1.0\n${t(lang, 'usage')}\n\nnpm run compare -- <before-url> <after-url> [options]\n\n--out reports/comparison\n--path /route     (repeat, max 5; defaults to the exact URLs)\n--mask .dynamic   (repeat, max 10; each selector must match)\n--ready main     (wait for a visible element on both pages)\n--timeout 15000  (1000–60000 ms per capture operation)\n--delay 200      (0–5000 ms after readiness and fonts)\n--lang en        (en | ko | zh-CN | ja | es)\n\nExit: 0 = report ready; 1 = capture failure; 2 = input/setup/write failure.\nVisual changes alone do not fail the command.\nInstall Chromium: npx playwright install chromium`,
    );
  } else {
    const out = resolve(options.out);
    await mkdir(dirname(out), { recursive: true });
    try {
      await mkdir(out);
    } catch (error) {
      if (error.code === 'EEXIST') throw new Error('outputExists');
      throw error;
    }
    const report = await collect(options, (row, index, total) =>
      console.log(
        `[${index}/${total}] ${row.viewport.name}: ${t(lang, row.status)}${row.diff ? ' · ' + (row.diff.ratio * 100).toFixed(2) + '%' : ''}`,
      ),
    );
    const html = makeReport(report);
    if (Buffer.byteLength(html) > 64 * 1024 * 1024) throw new Error('limits');
    for (const row of report.cases)
      for (const side of ['before', 'after', 'diff']) {
        if (row[side]?.image)
          await writeFile(
            resolve(out, `${row.id}-${side}.png`),
            Buffer.from(row[side].image, 'base64'),
            { flag: 'wx' },
          );
      }
    const metadata = JSON.parse(
      JSON.stringify(report, (key, value) => (key === 'image' ? undefined : value)),
    );
    await writeFile(resolve(out, 'report.json'), JSON.stringify(metadata, null, 2) + '\n', {
      flag: 'wx',
    });
    await writeFile(resolve(out, 'index.html'), html, { flag: 'wx' });
    console.log(`${t(lang, 'saved')}: ${resolve(out, 'index.html')}`);
    if (report.cases.some((row) => row.status === 'error')) process.exitCode = 1;
  }
} catch (error) {
  console.error(t(lang, error.message === 'language' ? 'languageError' : error.message));
  process.exitCode = 2;
}
