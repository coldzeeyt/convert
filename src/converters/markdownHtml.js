import { marked } from "marked";
import TurndownService from "turndown";
import { el, card, downloadBlob } from "../helpers.js";

const turndown = new TurndownService();

export function render(container) {
  const direction = el("select", {}, [
    el("option", { value: "md2html" }, ["Markdown → HTML"]),
    el("option", { value: "html2md" }, ["HTML → Markdown"]),
  ]);
  const input = el("textarea", { rows: "12", placeholder: "Paste your Markdown or HTML here..." });
  const output = el("textarea", { rows: "12", readonly: "readonly" });
  const preview = el("div", { class: "card", style: "max-height:260px;overflow:auto" });
  const convertBtn = el("button", {}, ["Convert"]);
  const copyBtn = el("button", { class: "secondary" }, ["Copy result"]);
  const downloadBtn = el("button", { class: "secondary" }, ["Download file"]);

  function run() {
    const val = input.value;
    if (direction.value === "md2html") {
      const html = marked.parse(val);
      output.value = html;
      preview.innerHTML = html;
    } else {
      output.value = turndown.turndown(val);
      preview.innerHTML = "<em>Preview only shown for Markdown → HTML.</em>";
    }
  }

  convertBtn.addEventListener("click", run);
  copyBtn.addEventListener("click", () => navigator.clipboard.writeText(output.value));
  downloadBtn.addEventListener("click", () => {
    const ext = direction.value === "md2html" ? "html" : "md";
    const type = ext === "html" ? "text/html" : "text/markdown";
    downloadBlob(new Blob([output.value], { type }), `converted.${ext}`);
  });

  container.append(
    card("Direction", [direction]),
    card("Input", [input]),
    el("div", { class: "row" }, [convertBtn, copyBtn, downloadBtn]),
    card("Output", [output]),
    card("Rendered preview", [preview]),
  );
}
