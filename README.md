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
- Images: PNG, JPG, WebP, BMP, ICO, with optional resizing/quality control
- Markdown ⇄ HTML, CSV ⇄ JSON, JSON ⇄ YAML
- Images/Text → PDF, and PDF → Images (page by page)
- Zip files together / unzip and browse a `.zip`

**Handy tools**
- Unit converter, number base converter (bin/oct/dec/hex)
- Word & character counter, text case converter, diff checker
- JSON formatter/validator, Base64 and URL encode/decode
- SHA-1/256/384/512 hash generator (text or file)
- Password generator, color converter, QR code generator
- Random number generator / list picker & shuffler, Lorem Ipsum generator
- Stopwatch, countdown/Pomodoro timer
- GPA calculator, quick APA/MLA citation drafter

**Not included, on purpose:** a YouTube downloader. Ripping video off
YouTube breaks its Terms of Service and can be copyright infringement — the
"YouTube → MP4" entry in the app explains this and points to legitimate
alternatives (converting a file you already legally have, official offline
downloads, teacher-provided copies, etc).

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
- Images: Canvas API, plus small hand-rolled BMP/ICO encoders.
- Archives: [`jszip`](https://stuk.github.io/jszip/).
- CSV: [`papaparse`](https://www.papaparse.com/); YAML: [`js-yaml`](https://github.com/nodeca/js-yaml); Markdown: [`marked`](https://marked.js.org/) + [`turndown`](https://github.com/mixmark-io/turndown).
