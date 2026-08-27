import { el, card, makeDropzone, outputLink, formatBytes, replaceExt, readFileAsText } from "../helpers.js";

const FORMATS = { png: { label: "PNG", mime: "image/png" }, jpg: { label: "JPG / JPEG", mime: "image/jpeg" } };

function getSvgSize(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;
  const w = parseFloat(svg.getAttribute("width"));
  const h = parseFloat(svg.getAttribute("height"));
  if (w > 0 && h > 0) return { width: w, height: h };
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return { width: parts[2], height: parts[3] };
  }
  return { width: 512, height: 512 };
}

export function render(container) {
  let currentFile = null;
  const fileInfo = el("div", { class: "hint" }, ["No file selected yet."]);
  const preview = el("div");
  const formatSelect = el("select", {}, Object.entries(FORMATS).map(([k, v]) => el("option", { value: k }, [v.label])));
  const widthInput = el("input", { type: "number", min: "1", placeholder: "auto" });
  const scaleInput = el("input", { type: "number", min: "1", max: "8", value: "2", style: "width:70px" });
  const convertBtn = el("button", { disabled: "disabled" }, ["Convert"]);
  const outputArea = el("div");
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  const dropzone = makeDropzone({
    accept: ".svg,image/svg+xml",
    onFiles: async (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      // Preview via <img src="blob:..."> rather than injecting the SVG markup
      // into the page — an <img> renders SVG as a plain raster image with no
      // script/event-handler execution, unlike inline HTML injection, which
      // would let a malicious SVG (e.g. an onload handler) run in this page.
      const url = URL.createObjectURL(currentFile);
      preview.replaceChildren(el("img", { src: url, style: "max-width:220px;max-height:160px;border-radius:8px;border:1px solid var(--border);background:#fff" }));
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
      errorBox.style.display = "none";
    },
    hint: "Vector graphics (.svg)",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    errorBox.style.display = "none";
    outputArea.replaceChildren();
    try {
      const text = await readFileAsText(currentFile);
      const base = getSvgSize(text);
      const scale = parseFloat(scaleInput.value) || 2;
      const targetWidth = parseInt(widthInput.value, 10) || base.width * scale;
      const targetHeight = Math.round((base.height / base.width) * targetWidth);

      const svgBlob = new Blob([text], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Couldn't parse that SVG"));
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (formatSelect.value === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);

      const fmt = FORMATS[formatSelect.value];
      const blob = await new Promise((res) => canvas.toBlob(res, fmt.mime, 0.92));
      outputLink(outputArea, blob, replaceExt(currentFile.name, formatSelect.value));
    } catch (err) {
      errorBox.style.display = "block";
      errorBox.textContent = err.message || String(err);
    }
  });

  container.append(
    card("1. Choose an SVG", [dropzone, fileInfo, preview]),
    card("2. Options", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Output format"]), formatSelect]),
        el("div", { class: "col" }, [el("label", {}, ["Target width px (optional)"]), widthInput]),
        el("div", { class: "col" }, [el("label", {}, ["Scale (if width blank)"]), scaleInput]),
      ]),
      el("div", { class: "row", style: "margin-top:14px" }, [convertBtn]),
    ]),
    card("3. Result", [errorBox, outputArea]),
    el("div", { class: "notice" }, ["Rendered locally on a canvas — nothing is uploaded."]),
  );
}
