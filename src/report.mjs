import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { messages } from './i18n.mjs';
const safeJson = (value) =>
  JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (char) => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'),
  );
const digest = (value) => createHash('sha256').update(value).digest('base64');
export function makeReport(report) {
  const css = readFileSync(new URL('./report.css', import.meta.url), 'utf8');
  const js =
    `const REPORT=${safeJson(report)};const MESSAGES=${safeJson(messages)};\n` +
    readFileSync(new URL('./report-client.js', import.meta.url), 'utf8');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'sha256-${digest(css)}'; script-src 'sha256-${digest(js)}'; base-uri 'none'; form-action 'none'; object-src 'none'"><title>Diffshot — Visual change report</title><style>${css}</style></head><body>
  <header class="topbar"><a class="brand" href="https://github.com/jeffrog-256k1/diffshot"><b>≠</b>diffshot<span class="version">/ 0.1</span></a><nav><a id="docs" data-t="docs" href="https://github.com/jeffrog-256k1/diffshot">Documentation ↗</a><label class="sr-only" for="language" data-t="language">Language</label><select id="language"><option value="en">English</option><option value="ko">한국어</option><option value="zh-CN">简体中文</option><option value="ja">日本語</option><option value="es">Español</option></select></nav></header>
  <main><section class="intro"><div><p class="eyebrow" data-t="eyebrow"></p><h1><span data-t="title"></span><br><em data-t="accent"></em></h1></div><div class="intro-note"><p data-t="intro"></p><span class="sample" id="sample" data-t="demo" hidden></span></div></section>
  <div class="sources"><div><span data-t="before"></span><code id="before-url"></code></div><div><span data-t="after"></span><code id="after-url"></code></div></div>
  <div class="stats"><div><b id="total"></b><span data-t="total"></span></div><div><b id="changed"></b><span data-t="changed"></span></div><div><b id="failed"></b><span data-t="error"></span></div></div>
  <div class="workspace"><aside class="sidebar"><div class="section-head"><h2 data-t="cases"></h2></div><div class="case-list" id="case-list"></div></aside><section class="workspace-right"><div class="section-head"><h2 data-t="canvas"></h2><div class="modes" id="modes"><button class="mode" id="mode-compare" data-t="compare"></button><button class="mode" id="mode-overlay" data-t="overlay"></button><button class="mode" id="mode-difference" data-t="difference"></button></div></div>
  <div class="case-meta"><span id="case-label"></span><span id="change-value"></span></div><div class="viewer" id="viewer"><div class="image-scroll"><div class="paired" id="compare"><figure><figcaption data-t="before"></figcaption><img id="before-image" alt="Before"></figure><figure><figcaption data-t="after"></figcaption><img id="after-image" alt="After"></figure></div>
  <div id="overlay" hidden><svg id="overlay-svg" role="img" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="after-clip"><rect id="clip" x="0" y="0" width="0" height="0"/></clipPath></defs><image id="before-overlay" x="0" y="0"/><image id="after-overlay" x="0" y="0" clip-path="url(#after-clip)"/><line id="split-line" y1="0" stroke="#e34422" stroke-width="3"/></svg></div><div id="difference" class="checker" hidden><img id="diff-image" alt="Difference"></div></div>
  <div class="slider-row" id="slider-row" hidden><label for="slider" data-t="slider"></label><input type="range" id="slider" min="0" max="100" value="50"><span id="slider-value">50%</span></div></div>
  <div class="failure" id="failure" hidden><h3 data-t="error"></h3><p id="failure-detail"></p><p data-t="failure"></p></div><p class="warning" id="size-warning" data-t="sizeChange" hidden></p><p class="warning" id="overflow-warning" data-t="overflow" hidden></p>
  <div class="downloads" id="downloads"><a id="download-before" data-t="downloadBefore"></a><a id="download-after" data-t="downloadAfter"></a><a id="download-diff" data-t="downloadDiff"></a></div></section></div>
  <div class="notes"><article><h3 data-t="guide"></h3><p data-t="guideBody"></p></article><article><h3 data-t="local"></h3><p data-t="localBody"></p></article></div><details><summary data-t="details"></summary><pre id="settings"></pre></details></main>
  <footer><a href="https://leejungjae.app">BY JEFFROG-256K1 ↗</a><span>CAPTURE / COMPARE / SHARE</span><a href="https://github.com/jeffrog-256k1/diffshot">MIT · GITHUB ↗</a></footer><script>${js}</script></body></html>`;
}
