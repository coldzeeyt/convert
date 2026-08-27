import { el, card, makeDropzone, outputLink, formatBytes } from "../helpers.js";

export function render(container) {
  let currentFile = null;
  const fileInfo = el("div", { class: "hint" }, ["No file selected yet."]);
  const convertBtn = el("button", { disabled: "disabled" }, ["Extract"]);
  const outputArea = el("div");
  const preview = el("div", { class: "card", style: "max-height:320px;overflow:auto" });
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  const dropzone = makeDropzone({
    accept: ".docx",
    onFiles: (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
      preview.replaceChildren();
      errorBox.style.display = "none";
    },
    hint: "Word documents (.docx) — .doc (old format) isn't supported",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    errorBox.style.display = "none";
    outputArea.replaceChildren();
    preview.replaceChildren(el("div", { class: "hint" }, ["Extracting..."]));
    try {
      const mammothModule = await import("mammoth/mammoth.browser.js");
      const mammoth = mammothModule.default || mammothModule;
      const buf = await currentFile.arrayBuffer();
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buf });
      const textResult = await mammoth.extractRawText({ arrayBuffer: buf });
      const base = currentFile.name.replace(/\.docx$/i, "");

      preview.replaceChildren();
      // Rendered from mammoth's structural conversion, not raw file bytes —
      // mammoth builds this HTML itself from the doc's structure rather than
      // passing through embedded markup. The one thing a crafted .docx could
      // still smuggle in is a javascript: link target, so strip anything
      // that isn't http(s)/mailto/relative before it goes in the page.
      const previewFrame = document.createElement("div");
      previewFrame.innerHTML = htmlResult.value;
      for (const a of previewFrame.querySelectorAll("a[href]")) {
        if (!/^(https?:|mailto:|#|\/|\.)/i.test(a.getAttribute("href"))) a.removeAttribute("href");
      }
      preview.append(previewFrame);

      outputLink(outputArea, new Blob([textResult.value], { type: "text/plain" }), `${base}.txt`, "Download as plain text");
      outputLink(outputArea, new Blob([htmlResult.value], { type: "text/html" }), `${base}.html`, "Download as HTML");

      if (htmlResult.messages.length) {
        errorBox.style.display = "block";
        errorBox.className = "notice";
        errorBox.textContent = `Note: ${htmlResult.messages.map((m) => m.message).join("; ")}`;
      }
    } catch (err) {
      preview.replaceChildren();
      errorBox.style.display = "block";
      errorBox.className = "notice warn";
      errorBox.textContent = `Couldn't read that file: ${err.message || err}`;
    }
  });

  container.append(
    card("1. Choose a Word document", [dropzone, fileInfo]),
    el("div", { class: "row", style: "margin:12px 0" }, [convertBtn]),
    errorBox,
    card("Preview", [preview]),
    card("Downloads", [outputArea]),
    el("div", { class: "notice" }, ["Extracted locally with mammoth.js — nothing is uploaded. Great for pulling text out of a Word doc when you don't have Word installed."]),
  );
}
