import * as pdfjsLib from "pdfjs-dist";
import { el, card, makeDropzone, outputLink, formatBytes, readFileAsArrayBuffer } from "../helpers.js";

// Resolved against document.baseURI (not location.origin) so this still
// works when the site is hosted under a subpath, e.g. GitHub Pages project
// sites at /convert/.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs/pdf.worker.min.mjs", document.baseURI).href;

export function render(container) {
  let currentFile = null;
  const fileInfo = el("div", { class: "hint" }, ["No PDF selected yet."]);
  const formatSelect = el("select", {}, [
    el("option", { value: "png" }, ["PNG"]),
    el("option", { value: "jpeg" }, ["JPG"]),
  ]);
  const scaleInput = el("input", { type: "number", min: "0.5", max: "4", step: "0.5", value: "2" });
  const convertBtn = el("button", { disabled: "disabled" }, ["Convert pages to images"]);
  const outputArea = el("div", { class: "grid-3" });
  const statusBox = el("div", { class: "hint" });

  const dropzone = makeDropzone({
    accept: "application/pdf",
    onFiles: (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
    },
    hint: "One image per page, downloadable individually",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    convertBtn.setAttribute("disabled", "disabled");
    outputArea.replaceChildren();
    try {
      const bytes = await readFileAsArrayBuffer(currentFile);
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const scale = parseFloat(scaleInput.value) || 2;
      const ext = formatSelect.value === "png" ? "png" : "jpg";
      const mime = formatSelect.value === "png" ? "image/png" : "image/jpeg";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        statusBox.textContent = `Rendering page ${pageNum} of ${pdf.numPages}...`;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        const blob = await new Promise((res) => canvas.toBlob(res, mime, 0.92));
        const box = el("div", { class: "card" }, [
          el("img", { src: URL.createObjectURL(blob), style: "width:100%;border-radius:6px" }),
        ]);
        outputLink(box, blob, `page-${pageNum}.${ext}`);
        outputArea.append(box);
      }
      statusBox.textContent = `Done — ${pdf.numPages} page(s) converted.`;
    } catch (err) {
      statusBox.textContent = `Error: ${err.message || err}`;
    } finally {
      convertBtn.removeAttribute("disabled");
    }
  });

  container.append(
    card("1. Choose a PDF", [dropzone, fileInfo]),
    card("2. Options", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Image format"]), formatSelect]),
        el("div", { class: "col" }, [el("label", {}, ["Resolution scale"]), scaleInput]),
      ]),
      el("div", { class: "row", style: "margin-top:12px" }, [convertBtn]),
      statusBox,
    ]),
    card("3. Pages", [outputArea]),
    el("div", { class: "notice" }, ["Rendered locally with pdf.js — nothing leaves your browser."]),
  );
}
