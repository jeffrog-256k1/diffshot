import { mkdir, writeFile } from 'node:fs/promises';
import { startFixture } from '../examples/fixture.mjs';
import { collect } from '../src/capture.mjs';
import { parseArgs } from '../src/options.mjs';
const fixture = await startFixture();
try {
  const data = await collect(
    parseArgs([fixture.url + '/before', fixture.url + '/after', '--ready', '#ready']),
  );
  if (data.cases.some((row) => row.status !== 'changed'))
    throw new Error('Demo must contain real changes in all viewports');
  data.sample = true;
  data.createdAt = '2026-10-12T00:00:00.000Z';
  data.before = 'https://before.example/studio';
  data.after = 'https://after.example/studio';
  for (const row of data.cases) {
    row.before.url = data.before;
    row.after.url = data.after;
  }
  await mkdir('assets', { recursive: true });
  await writeFile('assets/demo.json', JSON.stringify(data));
  console.log('Captured three fictional before/after pairs.');
} finally {
  await fixture.close();
}
