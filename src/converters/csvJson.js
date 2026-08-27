import Papa from "papaparse";
import { el, card, downloadBlob, makeDropzone, readFileAsText } from "../helpers.js";

export function render(container) {
  const direction = el("select", {}, [
    el("option", { value: "csv2json" }, ["CSV → JSON"]),
    el("option", { value: "json2csv" }, ["JSON → CSV"]),
  ]);
  const input = el("textarea", { rows: "12", placeholder: "Paste CSV or JSON here, or drop a file below..." });
  const output = el("textarea", { rows: "12", readonly: "readonly" });
  const convertBtn = el("button", {}, ["Convert"]);
  const copyBtn = el("button", { class: "secondary" }, ["Copy result"]);
  const downloadBtn = el("button", { class: "secondary" }, ["Download file"]);
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  const dropzone = makeDropzone({
    accept: ".csv,.json,text/csv,application/json",
    onFiles: async (files) => { input.value = await readFileAsText(files[0]); },
    hint: "Optional: drop a .csv or .json file instead of pasting",
  });

  function showError(msg) {
    errorBox.style.display = msg ? "block" : "none";
    errorBox.textContent = msg || "";
  }

  convertBtn.addEventListener("click", () => {
    showError("");
    try {
      if (direction.value === "csv2json") {
        const result = Papa.parse(input.value.trim(), { header: true, skipEmptyLines: true, dynamicTyping: true });
        if (result.errors.length) throw new Error(result.errors[0].message);
        output.value = JSON.stringify(result.data, null, 2);
      } else {
        const data = JSON.parse(input.value);
        const rows = Array.isArray(data) ? data : [data];
        output.value = Papa.unparse(rows);
      }
    } catch (err) {
      showError(`Couldn't convert: ${err.message}`);
      output.value = "";
    }
  });

  copyBtn.addEventListener("click", () => navigator.clipboard.writeText(output.value));
  downloadBtn.addEventListener("click", () => {
    const ext = direction.value === "csv2json" ? "json" : "csv";
    const type = ext === "json" ? "application/json" : "text/csv";
    downloadBlob(new Blob([output.value], { type }), `converted.${ext}`);
  });

  container.append(
    card("Direction", [direction]),
    card("Input", [input, dropzone]),
    el("div", { class: "row" }, [convertBtn, copyBtn, downloadBtn]),
    errorBox,
    card("Output", [output]),
    el("div", { class: "notice" }, ["CSV → JSON assumes the first row is a header row."]),
  );
}
