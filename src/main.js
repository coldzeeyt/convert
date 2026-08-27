import "./style.css";
import { el, pageHeader } from "./helpers.js";

const NAV = [
  {
    group: "Convert — Audio & Video",
    items: [
      { id: "audio", icon: "🎵", label: "Audio Converter", load: () => import("./converters/audio.js") },
      { id: "video", icon: "🎬", label: "Video Converter", load: () => import("./converters/video.js") },
      { id: "youtube", icon: "▶️", label: "YouTube → MP4", load: () => import("./converters/youtubeNote.js") },
    ],
  },
  {
    group: "Convert — Images & Docs",
    items: [
      { id: "image", icon: "🖼️", label: "Image Converter", load: () => import("./converters/image.js") },
      { id: "markdown-html", icon: "📝", label: "Markdown ⇄ HTML", load: () => import("./converters/markdownHtml.js") },
      { id: "csv-json", icon: "📊", label: "CSV ⇄ JSON", load: () => import("./converters/csvJson.js") },
      { id: "json-yaml", icon: "🔧", label: "JSON ⇄ YAML", load: () => import("./converters/jsonYaml.js") },
      { id: "pdf-tools", icon: "📄", label: "Images/Text → PDF", load: () => import("./converters/pdfTools.js") },
      { id: "pdf-images", icon: "🗂️", label: "PDF → Images", load: () => import("./converters/pdfToImages.js") },
      { id: "archive", icon: "🗜️", label: "Zip / Unzip", load: () => import("./converters/archive.js") },
    ],
  },
  {
    group: "Handy Tools",
    items: [
      { id: "unit-converter", icon: "📏", label: "Unit Converter", load: () => import("./tools/unitConverter.js") },
      { id: "number-base", icon: "🔢", label: "Number Base Converter", load: () => import("./tools/numberBase.js") },
      { id: "word-counter", icon: "🔤", label: "Word & Char Counter", load: () => import("./tools/wordCounter.js") },
      { id: "text-case", icon: "🔡", label: "Text Case Converter", load: () => import("./tools/textCase.js") },
      { id: "diff-checker", icon: "🆚", label: "Text Diff Checker", load: () => import("./tools/diffChecker.js") },
      { id: "json-formatter", icon: "🧩", label: "JSON Formatter", load: () => import("./tools/jsonFormatter.js") },
      { id: "base64", icon: "🔐", label: "Base64 Encode/Decode", load: () => import("./tools/base64.js") },
      { id: "url-encode", icon: "🔗", label: "URL Encode/Decode", load: () => import("./tools/urlEncode.js") },
      { id: "hash-generator", icon: "#️⃣", label: "Hash Generator", load: () => import("./tools/hashGenerator.js") },
      { id: "password-generator", icon: "🔑", label: "Password Generator", load: () => import("./tools/passwordGenerator.js") },
      { id: "color-converter", icon: "🎨", label: "Color Converter", load: () => import("./tools/colorConverter.js") },
      { id: "qr-generator", icon: "▦", label: "QR Code Generator", load: () => import("./tools/qrGenerator.js") },
      { id: "random-generator", icon: "🎲", label: "Random Number/Picker", load: () => import("./tools/randomGenerator.js") },
      { id: "lorem-ipsum", icon: "📰", label: "Lorem Ipsum Generator", load: () => import("./tools/loremIpsum.js") },
      { id: "stopwatch-timer", icon: "⏱️", label: "Stopwatch / Timer", load: () => import("./tools/stopwatchTimer.js") },
      { id: "gpa-calculator", icon: "🎓", label: "GPA Calculator", load: () => import("./tools/gpaCalculator.js") },
      { id: "citation-generator", icon: "📚", label: "Citation Generator", load: () => import("./tools/citationGenerator.js") },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);
const DESCRIPTIONS = {
  audio: "Convert between MP3, WAV, OGG, FLAC, M4A and Opus, entirely in your browser.",
  video: "Convert between MP4, WebM, MOV, AVI and GIF, or pull the audio out of a video.",
  youtube: "Why this isn't a YouTube downloader, and what to use instead.",
  image: "Convert between PNG, JPG, WebP, BMP and ICO, with optional resizing.",
  "markdown-html": "Turn Markdown into HTML or HTML back into Markdown, with a live preview.",
  "csv-json": "Convert spreadsheet-style CSV data to JSON and back.",
  "json-yaml": "Convert between JSON and YAML configuration formats.",
  "pdf-tools": "Turn images or plain text into a PDF file.",
  "pdf-images": "Turn each page of a PDF into a downloadable PNG or JPG image.",
  archive: "Zip files together, or unzip and browse the contents of a .zip archive.",
  "unit-converter": "Length, weight, volume and temperature conversions.",
  "number-base": "Convert numbers between binary, octal, decimal and hexadecimal.",
  "word-counter": "Word count, character count, sentence count and reading time.",
  "text-case": "UPPERCASE, lowercase, Title Case, camelCase, snake_case and more.",
  "diff-checker": "Compare two blocks of text and see exactly what changed.",
  "json-formatter": "Pretty-print, validate and minify JSON.",
  base64: "Encode or decode text or files as Base64.",
  "url-encode": "Percent-encode or decode text and URLs.",
  "hash-generator": "Compute SHA-1/256/384/512 checksums for text or files.",
  "password-generator": "Generate strong random passwords.",
  "color-converter": "Convert colors between HEX, RGB and HSL, with a picker.",
  "qr-generator": "Turn any text or URL into a downloadable QR code.",
  "random-generator": "Random numbers, and picking or shuffling a list.",
  "lorem-ipsum": "Generate placeholder text for mockups and layouts.",
  "stopwatch-timer": "A stopwatch with laps, plus a countdown timer for Pomodoro-style study sessions.",
  "gpa-calculator": "Calculate your GPA on the standard 4.0 scale.",
  "citation-generator": "Quickly draft an APA or MLA citation for a source.",
};

function findItem(id) { return ALL_ITEMS.find((i) => i.id === id); }

async function renderRoute() {
  const id = location.hash.slice(1) || "home";
  const main = document.querySelector(".main");
  main.replaceChildren();
  document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.toggle("active", btn.dataset.id === id));

  if (id === "home") {
    renderHome(main);
    return;
  }

  const item = findItem(id);
  if (!item) { renderHome(main); return; }

  main.append(pageHeader(`${item.icon} ${item.label}`, DESCRIPTIONS[item.id]));
  const loadingMsg = el("div", { class: "hint" }, ["Loading…"]);
  main.append(loadingMsg);
  try {
    const mod = await item.load();
    loadingMsg.remove();
    mod.render(main);
  } catch (err) {
    loadingMsg.textContent = `Failed to load this tool: ${err.message || err}`;
  }
}

function renderHome(main) {
  main.append(
    pageHeader("🧰 Toolbox", "An all-in-one file converter and study toolkit that runs completely in your browser — no uploads, no accounts, nothing to install."),
    el("div", { class: "notice" }, [
      "Everything here processes files locally on your device using JavaScript in this tab. Nothing is sent to a server, so it works the same on any network and keeps your files private.",
    ]),
  );
  for (const group of NAV) {
    main.append(el("h2", { style: "font-size:14px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.04em;margin:22px 0 10px" }, [group.group]));
    main.append(el("div", { class: "grid-3" }, group.items.map((item) => {
      const tile = el("a", { href: `#${item.id}`, class: "card", style: "text-decoration:none;color:inherit;display:block;cursor:pointer" }, [
        el("div", { style: "font-size:22px;margin-bottom:6px" }, [item.icon]),
        el("div", { style: "font-weight:600;margin-bottom:4px" }, [item.label]),
        el("div", { class: "hint" }, [DESCRIPTIONS[item.id] || ""]),
      ]);
      return tile;
    })));
  }
}

function buildSidebar() {
  const sidebar = el("div", { class: "sidebar" }, [
    el("div", { class: "brand" }, ["🧰 Toolbox", el("span", { class: "brand-badge" }, ["LOCAL"])]),
  ]);
  const homeBtn = el("button", { class: "nav-item", "data-id": "home", onclick: () => { location.hash = ""; } }, [
    el("span", { class: "icon" }, ["🏠"]), "Home",
  ]);
  sidebar.append(homeBtn);
  for (const group of NAV) {
    sidebar.append(el("div", { class: "nav-group-title" }, [group.group]));
    for (const item of group.items) {
      sidebar.append(el("button", {
        class: "nav-item",
        "data-id": item.id,
        onclick: () => { location.hash = item.id; },
      }, [el("span", { class: "icon" }, [item.icon]), item.label]));
    }
  }
  return sidebar;
}

function boot() {
  const app = document.getElementById("app");
  app.append(buildSidebar(), el("div", { class: "main" }));
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}

boot();
