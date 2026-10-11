# Diffshot

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md)

**Two URLs. Three viewports. One report you can share.**

[Open the sample report](https://jeffrog-256k1.github.io/diffshot/?lang=en)

[![Diffshot](assets/preview.png)](https://jeffrog-256k1.github.io/diffshot/?lang=en)

Diffshot compares two versions of a web page, highlights visual differences, and packages the result in an offline HTML file. Use it to explain a UI change without setting up a visual regression service. The demo uses fictional pages; it does not accept or fetch visitor URLs.

## Run locally

Requires Node.js 22.12+ and npm. No account, server, or paid API is required. These commands run from the cloned repository; an npm package has not been published.

```sh
git clone https://github.com/jeffrog-256k1/diffshot.git
cd diffshot
npm ci
npx playwright install chromium
```

## Compare your pages

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --out reports/review-01 --lang en
```

Replace these loopback URLs with your own running pages or trusted public sites. Open the generated `reports/review-01/index.html` in a browser. Share that single file: its images, styles, and controls are embedded. Separate PNGs and a metadata-only `report.json` are also saved. Existing output folders are never overwritten; choose a new `--out` path for each run.

## What you get

- Desktop (1440×900), tablet (834×1112), and mobile (390×844) captures in fresh Chromium contexts, at device scale 1, UTC, en-US, and light color scheme.
- Full page height up to 8000px, captured at the viewport width. Horizontal overflow is flagged; content outside the viewport width is not shown.
- Side-by-side images, a draggable comparison slider, orange pixel differences, and PNG downloads. Added or removed page area counts even when it is blank white.
- Input errors, HTTP/navigation failures, and missing mask targets are distinct from a successful comparison. Partial capture failures remain visible in the report.
- English, Korean, Simplified Chinese, Japanese, and Spanish reports and introductory documentation. `--lang` also localizes CLI status and errors; technical flags and detailed help remain in English.

## Options

| Option      | Meaning                                                                |
| ----------- | ---------------------------------------------------------------------- |
| `--out`     | Output folder; must not already exist.                                 |
| `--path`    | Repeat up to 5 paths.                                                  |
| `--mask`    | Repeat up to 10 CSS selectors; every selector must match on each page. |
| `--ready`   | Wait for a visible selector and loaded fonts.                          |
| `--timeout` | 1000–60000 ms per capture operation, default 15000.                    |
| `--delay`   | 0–5000 ms after readiness, default 200.                                |
| `--lang`    | en, ko, zh-CN, ja, es; default en.                                     |

Every `--path` replaces the path on both base origins. Without it, the exact two URLs are used. Query strings may be used for capture but are redacted from report metadata; fragments are omitted. URL paths and screenshot content are not anonymized.

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --path / --path /about --mask .clock --ready main --out reports/review-02 --lang en
```

## Read the result

Exit 0 means a report was written with successful captures, including when images changed. Exit 1 means at least one capture failed; exit 2 means invalid input, setup, or write failure. This is a review tool, not a pass/fail CI gate. Percentages describe pixels, not the severity or correctness of a change. Anti-aliasing differences are excluded and the pixelmatch color threshold is 0.1.

## Limits and privacy

Animations and carets are disabled during capture and reduced motion is requested. Dynamic timestamps, content, videos, asynchronous data, and OS fonts can still differ. Use `--mask` for dynamic areas and `--ready` for application readiness; neither guarantees a deterministic site. No login/session import, arbitrary crawling, AI explanation, or automatic PR comments. Only visit pages you trust: their JavaScript runs in a fresh browser. Reports can contain private page content; review before sharing. Reports stay local and are never automatically uploaded.

## Development

```sh
npm test
npm run build
npm run test:browser
npm run dev
```

Regenerate the fictional sample with `npm run demo:capture`, then `npm run build`. Set `DIFFSHOT_BROWSER_CHANNEL=chrome` to use an installed Chrome instead of bundled Chromium. On Linux, `npx playwright install --with-deps chromium` installs browser dependencies. Tests cover identical pages, CSS and height changes, masking, HTTP failure, CLI exit codes/no-overwrite, HTML injection, offline downloads, five languages, and mobile overflow.

[CONTRIBUTING](CONTRIBUTING.md) · [SECURITY](SECURITY.md) · [CHANGELOG](CHANGELOG.md)

## License

MIT. Exported reports are yours to use; captured page content retains its own rights.

[LICENSE](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

[jeffrog-256k1](https://github.com/jeffrog-256k1) · [leejungjae.app](https://leejungjae.app)
