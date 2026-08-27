import { el, card, downloadBlob } from "../helpers.js";

export function render(container) {
  const input = el("textarea", { rows: "14", placeholder: "Paste JSON here..." });
  const output = el("textarea", { rows: "14", readonly: "readonly" });
  const indentInput = el("input", { type: "number", value: "2", min: "0", max: "8", style: "width:70px" });
  const formatBtn = el("button", {}, ["Format / Validate"]);
  const minifyBtn = el("button", { class: "secondary" }, ["Minify"]);
  const downloadBtn = el("button", { class: "secondary" }, ["Download"]);
  const status = el("div", { class: "notice" });

  function parseOrError() {
    try {
      return { ok: true, data: JSON.parse(input.value) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  formatBtn.addEventListener("click", () => {
    const r = parseOrError();
    if (!r.ok) {
      status.className = "notice warn";
      status.textContent = `Invalid JSON: ${r.error}`;
      output.value = "";
      return;
    }
    status.className = "notice";
    status.textContent = "Valid JSON ✓";
    output.value = JSON.stringify(r.data, null, parseInt(indentInput.value, 10) || 0);
  });

  minifyBtn.addEventListener("click", () => {
    const r = parseOrError();
    if (!r.ok) {
      status.className = "notice warn";
      status.textContent = `Invalid JSON: ${r.error}`;
      return;
    }
    status.className = "notice";
    status.textContent = "Valid JSON ✓";
    output.value = JSON.stringify(r.data);
  });

  downloadBtn.addEventListener("click", () => {
    if (output.value) downloadBlob(new Blob([output.value], { type: "application/json" }), "formatted.json");
  });

  container.append(
    card("JSON Formatter & Validator", [
      input,
      el("div", { class: "row", style: "margin:12px 0" }, [
        el("div", { class: "col" }, [el("label", {}, ["Indent"]), indentInput]),
        formatBtn, minifyBtn, downloadBtn,
      ]),
      status,
      output,
    ]),
  );
}
