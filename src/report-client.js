// REPORT and MESSAGES are safely serialized by report.mjs; no external resources.
const langs = ['en', 'ko', 'zh-CN', 'ja', 'es'];
let lang = langs.includes(new URL(location.href).searchParams.get('lang'))
  ? new URL(location.href).searchParams.get('lang')
  : REPORT.language;
if (!langs.includes(lang)) lang = 'en';
let current = 0,
  mode = 'compare';
const el = (id) => document.getElementById(id);
const t = (key) => MESSAGES[key]?.[langs.indexOf(lang)] ?? key;
const imageUrl = (value) => 'data:image/png;base64,' + value;
function render() {
  document.documentElement.lang = lang;
  el('language').value = lang;
  document.querySelectorAll('[data-t]').forEach((node) => {
    node.textContent = t(node.dataset.t);
  });
  el('slider').setAttribute('aria-label', t('slider'));
  el('before-url').textContent = REPORT.before;
  el('after-url').textContent = REPORT.after;
  el('total').textContent = REPORT.cases.length;
  el('changed').textContent = REPORT.cases.filter((row) => row.status === 'changed').length;
  el('failed').textContent = REPORT.cases.filter((row) => row.status === 'error').length;
  el('sample').hidden = !REPORT.sample;
  el('docs').href =
    `https://github.com/jeffrog-256k1/diffshot/blob/main/README${lang === 'en' ? '' : '.' + lang}.md`;
  el('case-list').replaceChildren();
  for (const [i, row] of REPORT.cases.entries()) {
    const button = document.createElement('button');
    button.className = 'case';
    button.setAttribute('aria-current', String(current === i));
    const path = document.createElement('small');
    path.className = 'case-path';
    path.textContent = row.path;
    const title = document.createElement('strong');
    title.textContent = `${row.viewport.name.toUpperCase()} · ${row.viewport.width}`;
    const metric = document.createElement('span');
    metric.className = 'metric';
    const state = document.createElement('span');
    state.textContent = t(row.status);
    const ratio = document.createElement('span');
    ratio.textContent = row.diff ? (row.diff.ratio * 100).toFixed(2) + '%' : '—';
    metric.append(state, ratio);
    button.append(path, title, metric);
    button.onclick = () => {
      current = i;
      render();
    };
    el('case-list').append(button);
  }
  const row = REPORT.cases[current];
  const failed = row.status === 'error';
  el('case-label').textContent =
    `${row.viewport.width} × ${row.viewport.height} / ${row.viewport.name.toUpperCase()}`;
  el('change-value').textContent = row.diff
    ? `${(row.diff.ratio * 100).toFixed(2)}% · ${row.diff.changedPixels.toLocaleString(lang)} ${t('pixels')}`
    : t('error');
  el('failure').hidden = !failed;
  el('viewer').hidden = failed;
  el('downloads').hidden = failed;
  el('modes').hidden = failed;
  el('failure-detail').textContent = [
    row.before.error ? t('before') + ': ' + t(row.before.error) : '',
    row.after.error ? t('after') + ': ' + t(row.after.error) : '',
  ]
    .filter(Boolean)
    .join(' / ');
  el('size-warning').hidden = !row.diff?.resizedPixels;
  el('overflow-warning').hidden = !(row.before.overflow || row.after.overflow);
  if (!failed) {
    for (const side of ['before', 'after']) {
      el(`${side}-image`).src = imageUrl(row[side].image);
      el(`${side}-image`).alt = t(side) + ' — ' + row[side].title;
      el(`${side}-overlay`).setAttribute('href', imageUrl(row[side].image));
      el(`${side}-overlay`).setAttribute('width', row[side].width);
      el(`${side}-overlay`).setAttribute('height', row[side].height);
    }
    el('overlay-svg').setAttribute('viewBox', `0 0 ${row.diff.width} ${row.diff.height}`);
    el('overlay-svg').setAttribute('aria-label', t('overlay'));
    el('clip').setAttribute('height', row.diff.height);
    el('split-line').setAttribute('y2', row.diff.height);
    el('diff-image').src = imageUrl(row.diff.image);
    el('diff-image').alt = t('difference');
    for (const [id, side] of [
      ['download-before', 'before'],
      ['download-after', 'after'],
      ['download-diff', 'diff'],
    ]) {
      el(id).href = imageUrl(row[side].image);
      el(id).download = `diffshot-${row.id}-${side}.png`;
    }
    setMode();
    setSlider();
  }
  el('settings').textContent = JSON.stringify(
    { captured: REPORT.createdAt, ...REPORT.settings },
    null,
    2,
  );
}
function setMode() {
  for (const name of ['compare', 'overlay', 'difference']) {
    el(name).hidden = mode !== name;
    el('mode-' + name).setAttribute('aria-pressed', String(mode === name));
  }
  el('slider-row').hidden = mode !== 'overlay';
}
function setSlider() {
  const x = (REPORT.cases[current].diff.width * Number(el('slider').value)) / 100;
  el('clip').setAttribute('width', x);
  el('split-line').setAttribute('x1', x);
  el('split-line').setAttribute('x2', x);
  el('slider-value').textContent = el('slider').value + '%';
}
for (const name of ['compare', 'overlay', 'difference'])
  el('mode-' + name).onclick = () => {
    mode = name;
    setMode();
  };
el('language').onchange = () => {
  lang = el('language').value;
  render();
};
el('slider').oninput = setSlider;
render();
