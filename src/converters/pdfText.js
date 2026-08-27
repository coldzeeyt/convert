import * as pdfjsLib from "pdfjs-dist";
import { el, card, makeDropzone, outputLink, formatBytes, readFileAsArrayBuffer } from "../helpers.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs/pdf.worker.min.mjs", document.baseURI).href;

export function render(container) {
  let currentFile = null;
  const fileInfo = el("div", { class: "hint" }, ["No PDF selected yet."]);
  const convertBtn = el("button", { disabled: "disabled" }, ["Extract text"]);
  const output = el("textarea", { rows: "16", readonly: "readonly" });
  const outputArea = el("div");
  const statusBox = el("div", { class: "hint" });
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  const dropzone = makeDropzone({
    accept: "application/pdf",
    onFiles: (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      convertBtn.removeAttribute("disabled");
      output.value = "";
      outputArea.replaceChildren();
      errorBox.style.display = "none";
    },
    hint: "Pulls the selectable text out of a PDF (scanned image-only pages won't have any)",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    convertBtn.setAttribute("disabled", "disabled");
    errorBox.style.display = "none";
    output.value = "";
    outputArea.replaceChildren();
    try {
      const bytes = await readFileAsArrayBuffer(currentFile);
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const pages = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        statusBox.textContent = `Reading page ${pageNum} of ${pdf.numPages}...`;
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => item.str).join(" "));
      }
      output.value = pages.join("\n\n");
      statusBox.textContent = `Done — extracted text from ${pdf.numPages} page(s).`;
      const base = currentFile.name.replace(/\.pdf$/i, "");
      outputLink(outputArea, new Blob([output.value], { type: "text/plain" }), `${base}.txt`);
    } catch (err) {
      errorBox.style.display = "block";
      errorBox.textContent = `Couldn't read that PDF: ${err.message || err}`;
      statusBox.textContent = "";
    } finally {
      convertBtn.removeAttribute("disabled");
    }
  });

  container.append(
    card("1. Choose a PDF", [dropzone, fileInfo]),
    el("div", { class: "row", style: "margin:12px 0" }, [convertBtn]),
    statusBox,
    errorBox,
    card("Extracted text", [output, outputArea]),
    el("div", { class: "notice" }, ["Extracted locally with pdf.js — nothing is uploaded."]),
  );
}
