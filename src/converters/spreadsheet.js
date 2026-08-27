import * as XLSX from "xlsx";
import { el, card, makeDropzone, outputLink, formatBytes } from "../helpers.js";

function spreadsheetToOutputs(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return { sheetName, json, csv };
}

function fromSpreadsheetSection() {
  let currentFile = null;
  const fileInfo = el("div", { class: "hint" }, ["No file selected yet."]);
  const convertBtn = el("button", { disabled: "disabled" }, ["Convert"]);
  const outputArea = el("div");
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  const dropzone = makeDropzone({
    accept: ".xlsx,.xls,.ods,.csv",
    onFiles: (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
      errorBox.style.display = "none";
    },
    hint: ".xlsx, .xls, .ods, or .csv — uses the first sheet",
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    errorBox.style.display = "none";
    outputArea.replaceChildren();
    try {
      const buf = await currentFile.arrayBuffer();
      const workbook = XLSX.read(buf, { type: "array" });
      const { json, csv } = spreadsheetToOutputs(workbook);
      const base = currentFile.name.replace(/\.[^.]+$/, "");
      outputLink(outputArea, new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }), `${base}.json`);
      outputLink(outputArea, new Blob([csv], { type: "text/csv" }), `${base}.csv`);
    } catch (err) {
      errorBox.style.display = "block";
      errorBox.textContent = `Couldn't read that file: ${err.message || err}`;
    }
  });

  return card("Spreadsheet → CSV / JSON", [dropzone, fileInfo, el("div", { class: "row", style: "margin:12px 0" }, [convertBtn]), errorBox, outputArea]);
}

function toSpreadsheetSection() {
  const input = el("textarea", { rows: "12", placeholder: 'Paste CSV, or a JSON array of objects like [{"name":"Alice","age":30}]...' });
  const convertBtn = el("button", {}, ["Build .xlsx"]);
  const outputArea = el("div");
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  convertBtn.addEventListener("click", () => {
    errorBox.style.display = "none";
    outputArea.replaceChildren();
    const text = input.value.trim();
    try {
      let sheet;
      if (text.startsWith("[") || text.startsWith("{")) {
        const data = JSON.parse(text);
        sheet = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
      } else {
        sheet = XLSX.utils.aoa_to_sheet(text.split("\n").map((line) => line.split(",")));
      }
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
      const out = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
      outputLink(outputArea, new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "spreadsheet.xlsx");
    } catch (err) {
      errorBox.style.display = "block";
      errorBox.textContent = `Couldn't build a spreadsheet from that: ${err.message || err}`;
    }
  });

  return card("CSV / JSON → Spreadsheet (.xlsx)", [input, el("div", { class: "row", style: "margin:12px 0" }, [convertBtn]), errorBox, outputArea]);
}

export function render(container) {
  container.append(
    fromSpreadsheetSection(),
    toSpreadsheetSection(),
    el("div", { class: "notice" }, ["Parsed and built locally with SheetJS — nothing is uploaded."]),
  );
}
