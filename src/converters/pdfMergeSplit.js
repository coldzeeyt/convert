import { PDFDocument } from "pdf-lib";
import { el, card, makeDropzone, outputLink, formatBytes } from "../helpers.js";

function mergeSection() {
  let files = [];
  const fileList = el("ul", { class: "file-list" });
  const mergeBtn = el("button", { disabled: "disabled" }, ["Merge into one PDF"]);
  const outputArea = el("div");
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  function renderList() {
    fileList.replaceChildren(...files.map((f, idx) =>
      el("li", {}, [
        f.name,
        el("div", { class: "row" }, [
          el("span", { class: "meta" }, [formatBytes(f.size)]),
          el("button", { class: "secondary", onclick: () => { files.splice(idx, 1); renderList(); } }, ["Remove"]),
        ]),
      ])));
    if (files.length >= 2) mergeBtn.removeAttribute("disabled");
    else mergeBtn.setAttribute("disabled", "disabled");
  }

  const dropzone = makeDropzone({
    accept: "application/pdf",
    multiple: true,
    onFiles: (newFiles) => { files = files.concat(newFiles); renderList(); },
    hint: "Add 2+ PDFs — they'll be merged in the order listed below",
  });

  mergeBtn.addEventListener("click", async () => {
    errorBox.style.display = "none";
    outputArea.replaceChildren();
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const out = await merged.save();
      outputLink(outputArea, new Blob([out], { type: "application/pdf" }), "merged.pdf");
    } catch (err) {
      errorBox.style.display = "block";
      errorBox.textContent = `Couldn't merge those files: ${err.message || err}`;
    }
  });

  return card("Merge PDFs", [dropzone, fileList, el("div", { class: "row", style: "margin-top:12px" }, [mergeBtn]), errorBox, outputArea]);
}

function splitSection() {
  let currentFile = null;
  let pageCount = 0;
  const fileInfo = el("div", { class: "hint" }, ["No PDF selected yet."]);
  const rangeInput = el("input", { type: "text", placeholder: "e.g. 1-3,5 (blank = every page as its own PDF)" });
  const splitBtn = el("button", { disabled: "disabled" }, ["Split"]);
  const outputArea = el("div");
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  function parseRanges(input, max) {
    if (!input.trim()) return Array.from({ length: max }, (_, i) => [i]);
    const groups = [];
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const m = trimmed.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) throw new Error(`Couldn't understand "${trimmed}"`);
      const start = parseInt(m[1], 10);
      const end = m[2] ? parseInt(m[2], 10) : start;
      if (start < 1 || end > max || start > end) throw new Error(`"${trimmed}" is out of range (this PDF has ${max} pages)`);
      groups.push(Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i));
    }
    return groups;
  }

  const dropzone = makeDropzone({
    accept: "application/pdf",
    onFiles: async (files) => {
      currentFile = files[0];
      const doc = await PDFDocument.load(await currentFile.arrayBuffer());
      pageCount = doc.getPageCount();
      fileInfo.textContent = `Selected: ${currentFile.name} — ${pageCount} page(s)`;
      splitBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
      errorBox.style.display = "none";
    },
    hint: "Split into individual pages, or custom page ranges",
  });

  splitBtn.addEventListener("click", async () => {
    errorBox.style.display = "none";
    outputArea.replaceChildren();
    try {
      const groups = parseRanges(rangeInput.value, pageCount);
      const srcBytes = await currentFile.arrayBuffer();
      const base = currentFile.name.replace(/\.pdf$/i, "");
      let i = 0;
      for (const indices of groups) {
        i++;
        const src = await PDFDocument.load(srcBytes);
        const out = await PDFDocument.create();
        const pages = await out.copyPages(src, indices);
        pages.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        outputLink(outputArea, new Blob([bytes], { type: "application/pdf" }), `${base}-part${i}.pdf`);
      }
    } catch (err) {
      errorBox.style.display = "block";
      errorBox.textContent = err.message || String(err);
    }
  });

  return card("Split a PDF", [dropzone, fileInfo, rangeInput, el("div", { class: "row", style: "margin-top:12px" }, [splitBtn]), errorBox, outputArea]);
}

export function render(container) {
  container.append(
    mergeSection(),
    splitSection(),
    el("div", { class: "notice" }, ["Merged/split locally with pdf-lib — nothing is uploaded."]),
  );
}
