import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { makeReport } from '../src/report.mjs';
const data = JSON.parse(await readFile('assets/demo.json', 'utf8'));
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', makeReport(data));
console.log('Built offline demo: dist/index.html');
