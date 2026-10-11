import { createServer } from 'node:http';

export function fixtureHtml(after = false, tall = false) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Fieldwork — fictional studio</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f3f1e8;color:#18332f;font-family:Arial,sans-serif}nav{padding:24px 6vw;border-bottom:1px solid #bcc8bb;display:flex;justify-content:space-between;font-size:12px}nav b{font-size:19px}main{padding:56px 6vw 40px;max-width:1600px;margin:auto}small{font:10px monospace;letter-spacing:2px;color:#5b7060}h1{font-size:clamp(43px,6vw,80px);font-weight:500;line-height:.98;letter-spacing:-3px;max-width:800px;margin:24px 0}h1 em{font-style:normal;color:${after ? '#d75b30' : '#739576'}}p{max-width:430px;font-size:15px;line-height:1.6;color:#5b7060}.cta{display:inline-block;padding:16px 24px;background:${after ? '#18332f' : '#e1e3d5'};color:${after ? '#fff' : '#18332f'};font-size:12px;margin:16px 0 32px;border:1px solid #abbba8}.grid{display:grid;grid-template-columns:repeat(3,minmax(${after ? '0' : '180px'},1fr));gap:18px;border-top:1px solid #bdc9b9;padding-top:23px}.tile{background:#dce2d3;padding:22px;min-height:190px}.tile:nth-child(2){background:#c0cdb9}.tile:nth-child(3){background:#e4d9c4}.orb{width:75px;height:75px;border:1px solid #658570;border-radius:50%;background:repeating-linear-gradient(35deg,transparent,transparent 4px,#658570 4px,#658570 5px);margin:18px 0}h2{font-size:15px;font-weight:500;margin:12px 0}.tile p{font-size:11px}.number{font:10px monospace;color:#5b7060}footer{padding:24px 6vw;border-top:1px solid #bdc9b9;font:10px monospace;color:#5b7060}.note{padding:25px;border:1px solid #bdc9b9;margin-top:30px;min-height:180px}body.tall main{min-height:1100px}${after ? '@media(max-width:600px){.grid{grid-template-columns:1fr}.tile{display:grid;grid-template-columns:90px 1fr;gap:14px;min-height:140px}.tile .orb{grid-row:1/4}.tile p,.tile h2{margin:0}main{padding-top:38px}}' : ''}
  </style></head><body class="${tall ? 'tall' : ''}"><nav><b>fieldwork®</b><span>INDEPENDENT DESIGN STUDIO</span></nav><main id="ready"><small>GOOD WORK STARTS WITH A QUESTION.</small><h1>Less noise.<br><em>More meaning.</em></h1><p>We help small teams give useful ideas a clear identity. Strategy, digital products, and things worth making.</p><span class="cta">LET'S MAKE SOMETHING ↗</span><div class="grid"><section class="tile"><div class="orb"></div><span class="number">01 / IDENTITY</span><h2>Find your voice.</h2><p>A distinct point of view, built to last.</p></section><section class="tile"><div class="orb"></div><span class="number">02 / DIGITAL</span><h2>Make it work.</h2><p>Interfaces that get out of the way.</p></section><section class="tile"><div class="orb"></div><span class="number">03 / SYSTEMS</span><h2>Keep it together.</h2><p>Small rules. Room to grow.</p></section></div>${after ? '<div class="note"><small>OPEN FOR COLLABORATION</small><h2>Good ideas deserve a good home.</h2><p>A new section, included in the comparison even when it changes the page height.</p></div>' : ''}</main><footer>FICTIONAL STUDIO · BUILT ONLY FOR DIFFSHOT DEMOS</footer></body></html>`;
}
export async function startFixture() {
  const server = createServer((req, res) => {
    const path = new URL(req.url, 'http://fixture.invalid').pathname;
    if (path === '/missing') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(fixtureHtml(path.startsWith('/after'), path === '/tall'));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
