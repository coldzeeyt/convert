# 🧰 Toolbox — all-in-one converter & study tools

A single-page web app with a big grid of file converters and everyday utilities.
Everything runs **entirely in your browser tab** — audio/video conversion,
image conversion, PDF handling, zipping, hashing, all of it happens locally
via JavaScript/WebAssembly. No file is ever uploaded to a server, there's no
backend, and no account is needed. That also means it works the same on any
network, which is the point if your school's usual converter sites are blocked.

## What's included

**Converters**
- Audio: MP3, WAV, OGG, FLAC, M4A/AAC, Opus
- Video: MP4, WebM, MOV, AVI, animated GIF, or extract just the audio track
- YouTube Viewer: paste a link and watch it right there, via YouTube's own embedded player
- Images: PNG, JPG, WebP, BMP, ICO, with optional resizing/quality control
- HEIC/HEIF (iPhone photos) → JPG/PNG
- SVG → PNG/JPG (rasterize a vector image at any size)
- Markdown ⇄ HTML, CSV ⇄ JSON, JSON ⇄ YAML
- Spreadsheet (.xlsx/.xls/.ods/.csv) ⇄ CSV/JSON, and build a new .xlsx from CSV/JSON
- Word .docx → plain text or HTML
- Images/Text → PDF, PDF → Images (page by page), PDF → Text, and Merge/Split PDFs
- Zip files together / unzip and browse a `.zip`

**Handy tools**
- Unit converter, number base converter (bin/oct/dec/hex)
- Roman numeral ⇄ number, fraction ⇄ decimal ⇄ percent
- Unix timestamp ⇄ human-readable date
- Word & character counter, text case converter, diff checker
- JSON formatter/validator, Base64 and URL encode/decode
- SHA-1/256/384/512 hash generator (text or file)
- Password generator, color converter, QR code generator
- Random number generator / list picker & shuffler, Lorem Ipsum generator
- Stopwatch, countdown/Pomodoro timer
- GPA calculator, quick APA/MLA citation drafter

**Not included, on purpose:** a YouTube downloader. Ripping video off
YouTube breaks its Terms of Service and can be copyright infringement — the
YouTube Viewer streams videos through YouTube's own embedded player instead
(nothing is downloaded or saved), and explains this plus points to
legitimate alternatives for offline copies (a file you already legally
have, official offline downloads, teacher-provided copies, etc).

## Running it locally

```bash
npm install
npm run dev       # dev server with hot reload
# or
npm run build && npm run preview   # production build, served locally
```

## Deploying it somewhere

This is a fully static site (`npm run build` outputs to `dist/`), so it can
be hosted anywhere that serves static files — GitHub Pages, Netlify, Vercel,
Cloudflare Pages, Railway, or just a folder on a USB stick opened via a local
static server. There's no server-side code and no API keys required.

The ffmpeg.wasm engine (`public/ffmpeg/`) and the pdf.js worker
(`public/pdfjs/`) are bundled into the repo and served from the same origin
as the rest of the site — nothing is fetched from a third-party CDN at
runtime, so it keeps working even on networks that block most outside
domains.

## Tech notes

- Vanilla JS + [Vite](https://vitejs.dev), no framework — kept deliberately
  simple and dependency-light.
- Audio/video conversion: [`@ffmpeg/ffmpeg`](https://github.com/ffmpegwasm/ffmpeg.wasm) (WebAssembly build of ffmpeg, single-threaded core — no special server headers required).
- PDF creation: [`pdf-lib`](https://pdf-lib.js.org/); PDF rendering: [`pdfjs-dist`](https://mozilla.github.io/pdf.js/).
- Images: Canvas API, plus small hand-rolled BMP/ICO encoders; HEIC decoding via [`heic2any`](https://github.com/alexcorvi/heic2any).
- Archives: [`jszip`](https://stuk.github.io/jszip/).
- CSV: [`papaparse`](https://www.papaparse.com/); YAML: [`js-yaml`](https://github.com/nodeca/js-yaml); Markdown: [`marked`](https://marked.js.org/) + [`turndown`](https://github.com/mixmark-io/turndown).
- Spreadsheets: [SheetJS](https://sheetjs.com/) `xlsx` — installed from SheetJS's own CDN tarball rather than the npm registry, since the npm-published build has unpatched vulnerabilities the project only fixes in its own distribution.
- Word docs: [`mammoth`](https://github.com/mwilliamson/mammoth.js) (docx → HTML/text; doesn't support the legacy .doc format).
