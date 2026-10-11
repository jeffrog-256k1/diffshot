# Security and privacy

Diffshot is a local CLI, not a public URL-fetching service. Only visit pages you trust and have permission to inspect: their JavaScript executes in Chromium. Captures use fresh contexts without your normal browser cookies or login state. This is not a network sandbox or an anonymization tool.

- Only HTTP(S) targets are accepted; embedded URL credentials are rejected. Local and private addresses are intentionally supported for development. Do not expose this CLI as a hosted API without your own authentication, isolation, and network controls.
- Query values and fragments are omitted from report metadata. Paths, page titles, and pixels can still contain private information. Browser error stacks are not included in reports or normal CLI error output.
- Reports are local and no upload occurs. Review every screenshot and metadata file before sharing. `.gitignore` excludes the default `reports/` directory; arbitrary custom output paths are your responsibility.
- Output requires a new directory. Existing directories are never overwritten, including on partial failures.
- Limit: 5 paths × 3 viewports, at most 10 mask selectors, viewport width ≤1440, captured height ≤8000px, and a 64 MiB generated HTML limit. There is no promise of total resource isolation from an untrusted page.
- Reports escape embedded JSON and render variable text with `textContent`. Inline script/style hashes enforce a restrictive CSP. Images are embedded as data URLs. Opening the report makes no external requests; explicit documentation links leave the report.

Report a vulnerability privately via this repository's Security → Report a vulnerability. Include a fictional reproducer, never real credentials, cookies, private reports, or production data.
