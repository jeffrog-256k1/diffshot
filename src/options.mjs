export const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];
export const languages = ['en', 'ko', 'zh-CN', 'ja', 'es'];
export function target(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('url');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    value.length > 2048
  )
    throw new Error('url');
  return url.href;
}
export function displayUrl(value) {
  const url = new URL(value);
  return url.origin + url.pathname + (url.search ? '?[redacted]' : '');
}
export function joinPath(base, path) {
  if (
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.includes('\\') ||
    path.length > 1024 ||
    /[\x00-\x1f]/.test(path)
  )
    throw new Error('path');
  const url = new URL(path, base);
  if (url.origin !== new URL(base).origin) throw new Error('path');
  return url.href;
}
export function parseArgs(args) {
  const result = {
    before: '',
    after: '',
    paths: [],
    masks: [],
    ready: '',
    timeout: 15000,
    delay: 200,
    lang: 'en',
    out: 'reports/comparison',
  };
  const positions = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      result.help = true;
      continue;
    }
    if (!arg.startsWith('--')) {
      positions.push(arg);
      continue;
    }
    if (
      !['--path', '--mask', '--ready', '--timeout', '--delay', '--lang', '--out'].includes(arg) ||
      args[i + 1] === undefined ||
      args[i + 1].startsWith('--')
    )
      throw new Error('options');
    const value = args[++i];
    if (arg === '--path') result.paths.push(value);
    else if (arg === '--mask') result.masks.push(value);
    else result[arg.slice(2)] = value;
  }
  if (!languages.includes(result.lang)) throw new Error('language');
  if (result.help) return result;
  if (positions.length !== 2) throw new Error('options');
  result.before = target(positions[0]);
  result.after = target(positions[1]);
  if (
    result.paths.length > 5 ||
    result.masks.length > 10 ||
    result.masks.some((s) => !s || s.length > 300) ||
    result.ready.length > 300
  )
    throw new Error('limits');
  result.paths.forEach((path) => joinPath(result.before, path));
  for (const [key, min, max] of [
    ['timeout', 1000, 60000],
    ['delay', 0, 5000],
  ]) {
    if (!/^\d+$/.test(String(result[key]))) throw new Error('limits');
    result[key] = Number(result[key]);
    if (result[key] < min || result[key] > max) throw new Error('limits');
  }
  if (!result.out.trim()) throw new Error('options');
  return result;
}
