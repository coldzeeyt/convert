import { el, card, makeDropzone, outputLink, replaceExt, formatBytes, readFileAsDataURL } from "../helpers.js";

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function canvasFromImage(img, maxWidth) {
  let { width, height } = img;
  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

// Minimal uncompressed 24-bit BMP encoder (canvas.toBlob doesn't support image/bmp).
function canvasToBmpBlob(canvas) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, w, h);
  const rowSize = Math.floor((24 * w + 31) / 32) * 4;
  const pixelArraySize = rowSize * h;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint16(0, 0x4d42, true); // "BM"
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // pixel data offset
  view.setUint32(14, 40, true); // DIB header size
  view.setInt32(18, w, true);
  view.setInt32(22, h, true);
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelArraySize, true);

  for (let y = 0; y < h; y++) {
    const srcY = h - 1 - y; // BMP rows are stored bottom-up
    let offset = 54 + y * rowSize;
    for (let x = 0; x < w; x++) {
      const i = (srcY * w + x) * 4;
      view.setUint8(offset++, data[i + 2]); // B
      view.setUint8(offset++, data[i + 1]); // G
      view.setUint8(offset++, data[i]); // R
    }
    // remaining bytes in the row (padding to a 4-byte boundary) stay zero
  }
  return new Blob([buffer], { type: "image/bmp" });
}

async function canvasToIcoBlob(canvas) {
  // ICO container wrapping a single PNG image (supported since Vista).
  const pngBlob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  const pngBuf = new Uint8Array(await pngBlob.arrayBuffer());
  const header = new ArrayBuffer(6 + 16);
  const view = new DataView(header);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, 1, true); // 1 image
  const w = canvas.width >= 256 ? 0 : canvas.width;
  const h = canvas.height >= 256 ? 0 : canvas.height;
  view.setUint8(6, w);
  view.setUint8(7, h);
  view.setUint8(8, 0); // color palette
  view.setUint8(9, 0); // reserved
  view.setUint16(10, 1, true); // color planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, pngBuf.byteLength, true);
  view.setUint32(18, 22, true); // offset
  return new Blob([header, pngBuf], { type: "image/x-icon" });
}

const FORMATS = {
  png: { label: "PNG", mime: "image/png" },
  jpg: { label: "JPG / JPEG", mime: "image/jpeg" },
  webp: { label: "WebP", mime: "image/webp" },
  bmp: { label: "BMP", mime: "image/bmp" },
  ico: { label: "ICO (favicon)", mime: "image/x-icon" },
};

export function render(container) {
  let currentFile = null;

  const fileInfo = el("div", { class: "hint" }, ["No file selected yet."]);
  const preview = el("div");
  const formatSelect = el("select", {}, Object.entries(FORMATS).map(([k, v]) => el("option", { value: k }, [v.label])));
  const qualityInput = el("input", { type: "number", min: "1", max: "100", value: "90", style: "width:70px" });
  const resizeInput = el("input", { type: "number", min: "1", placeholder: "e.g. 1280", style: "width:100px" });
  const convertBtn = el("button", { disabled: "disabled" }, ["Convert"]);
  const outputArea = el("div");

  const dropzone = makeDropzone({
    accept: "image/*",
    onFiles: async (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      const dataUrl = await readFileAsDataURL(currentFile);
      preview.replaceChildren(el("img", { src: dataUrl, style: "max-width:220px;max-height:160px;border-radius:8px;border:1px solid var(--border)" }));
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
    },
    hint: "PNG, JPG, WebP, BMP, GIF (first frame) and more",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    outputArea.replaceChildren();
    try {
      const dataUrl = await readFileAsDataURL(currentFile);
      const img = await loadImage(dataUrl);
      const maxWidth = resizeInput.value ? parseInt(resizeInput.value, 10) : null;
      const canvas = canvasFromImage(img, maxWidth);
      const fmt = formatSelect.value;
      const outName = replaceExt(currentFile.name, fmt === "jpg" ? "jpg" : fmt);

      let blob;
      if (fmt === "bmp") {
        blob = canvasToBmpBlob(canvas);
      } else if (fmt === "ico") {
        blob = await canvasToIcoBlob(canvas);
      } else {
        const quality = Math.min(1, Math.max(0.01, (parseInt(qualityInput.value, 10) || 90) / 100));
        blob = await new Promise((res) => canvas.toBlob(res, FORMATS[fmt].mime, quality));
      }
      outputLink(outputArea, blob, outName);
    } catch (err) {
      outputArea.append(el("div", { class: "notice warn" }, [`Error: ${err.message || err}`]));
    }
  });

  container.append(
    card("1. Choose an image", [dropzone, fileInfo, preview]),
    card("2. Options", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Output format"]), formatSelect]),
        el("div", { class: "col" }, [el("label", {}, ["Quality % (JPG/WebP)"]), qualityInput]),
        el("div", { class: "col" }, [el("label", {}, ["Max width px (optional)"]), resizeInput]),
      ]),
      el("div", { class: "row", style: "margin-top:14px" }, [convertBtn]),
    ]),
    card("3. Result", [outputArea]),
    el("div", { class: "notice" }, ["Processed entirely on your device using the Canvas API — nothing is uploaded."]),
  );
}
