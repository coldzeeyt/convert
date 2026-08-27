import { el, card, makeDropzone, outputLink, formatBytes, replaceExt } from "../helpers.js";

const FORMATS = { jpg: { label: "JPG / JPEG", mime: "image/jpeg" }, png: { label: "PNG", mime: "image/png" } };

export function render(container) {
  let currentFile = null;
  const fileInfo = el("div", { class: "hint" }, ["No file selected yet."]);
  const formatSelect = el("select", {}, Object.entries(FORMATS).map(([k, v]) => el("option", { value: k }, [v.label])));
  const convertBtn = el("button", { disabled: "disabled" }, ["Convert"]);
  const outputArea = el("div");
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  const dropzone = makeDropzone({
    accept: ".heic,.heif,image/heic,image/heif",
    onFiles: (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
      errorBox.style.display = "none";
    },
    hint: "iPhone photos (.heic / .heif)",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    convertBtn.setAttribute("disabled", "disabled");
    errorBox.style.display = "none";
    outputArea.replaceChildren(el("div", { class: "hint" }, ["Converting (loading the HEIC decoder the first time can take a moment)..."]));
    try {
      const { default: heic2any } = await import("heic2any");
      const fmt = FORMATS[formatSelect.value];
      const result = await heic2any({ blob: currentFile, toType: fmt.mime, quality: 0.92 });
      const blob = Array.isArray(result) ? result[0] : result;
      outputArea.replaceChildren();
      outputLink(outputArea, blob, replaceExt(currentFile.name, formatSelect.value));
    } catch (err) {
      outputArea.replaceChildren();
      errorBox.style.display = "block";
      errorBox.textContent = `Couldn't convert that file: ${err.message || err}`;
    } finally {
      convertBtn.removeAttribute("disabled");
    }
  });

  container.append(
    card("1. Choose a HEIC/HEIF photo", [dropzone, fileInfo]),
    card("2. Pick output format", [
      el("div", { class: "row" }, [formatSelect, convertBtn]),
    ]),
    card("3. Result", [errorBox, outputArea]),
    el("div", { class: "notice" }, ["Decoded entirely on your device — nothing is uploaded. Handy for iPhone photos, which schools/forms usually want as JPG or PNG."]),
  );
}
