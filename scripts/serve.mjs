import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const html = await readFile(new URL('../dist/index.html', import.meta.url));
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});
server.listen(4318, '127.0.0.1', () => console.log('Diffshot demo: http://127.0.0.1:4318'));
