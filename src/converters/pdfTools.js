import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { el, card, makeDropzone, outputLink, formatBytes, readFileAsArrayBuffer } from "../helpers.js";

function imagesToPdfSection() {
  let files = [];
  const fileList = el("ul", { class: "file-list" });
  const convertBtn = el("button", { disabled: "disabled" }, ["Build PDF"]);
  const outputArea = el("div");

  function renderList() {
    fileList.replaceChildren(...files.map((f) =>
      el("li", {}, [f.name, el("span", { class: "meta" }, [formatBytes(f.size)])])));
    if (files.length) convertBtn.removeAttribute("disabled");
  }

  const dropzone = makeDropzone({
    accept: "image/png,image/jpeg",
    multiple: true,
    onFiles: (newFiles) => { files = files.concat(newFiles); renderList(); },
    hint: "PNG or JPG images, one page per image, in the order you add them",
  });

  convertBtn.addEventListener("click", async () => {
    outputArea.replaceChildren();
    const pdfDoc = await PDFDocument.create();
    for (const file of files) {
      const bytes = await readFileAsArrayBuffer(file);
      const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
      const img = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const pdfBytes = await pdfDoc.save();
    outputLink(outputArea, new Blob([pdfBytes], { type: "application/pdf" }), "images.pdf");
  });

  return card("Images → PDF", [dropzone, fileList, el("div", { class: "row", style: "margin-top:12px" }, [convertBtn]), outputArea]);
}

function textToPdfSection() {
  const textarea = el("textarea", { rows: "10", placeholder: "Paste or type text — each line wraps to fit the page." });
  const convertBtn = el("button", {}, ["Build PDF"]);
  const outputArea = el("div");

  convertBtn.addEventListener("click", async () => {
    outputArea.replaceChildren();
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    const pageWidth = 612, pageHeight = 792;
    const maxWidth = pageWidth - margin * 2;

    const rawLines = textarea.value.split("\n");
    const lines = [];
    for (const raw of rawLines) {
      let line = "";
      for (const word of raw.split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      lines.push(line);
    }

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    const lineHeight = fontSize * 1.4;
    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
    const pdfBytes = await pdfDoc.save();
    outputLink(outputArea, new Blob([pdfBytes], { type: "application/pdf" }), "document.pdf");
  });

  return card("Text → PDF", [textarea, el("div", { class: "row", style: "margin-top:12px" }, [convertBtn]), outputArea]);
}

export function render(container) {
  container.append(
    imagesToPdfSection(),
    textToPdfSection(),
    el("div", { class: "notice" }, ["Built locally with pdf-lib — nothing leaves your browser."]),
  );
}
