import yaml from "js-yaml";
import { el, card, downloadBlob } from "../helpers.js";

export function render(container) {
  const direction = el("select", {}, [
    el("option", { value: "json2yaml" }, ["JSON → YAML"]),
    el("option", { value: "yaml2json" }, ["YAML → JSON"]),
  ]);
  const input = el("textarea", { rows: "14", placeholder: "Paste JSON or YAML here..." });
  const output = el("textarea", { rows: "14", readonly: "readonly" });
  const convertBtn = el("button", {}, ["Convert"]);
  const copyBtn = el("button", { class: "secondary" }, ["Copy result"]);
  const downloadBtn = el("button", { class: "secondary" }, ["Download file"]);
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  function showError(msg) {
    errorBox.style.display = msg ? "block" : "none";
    errorBox.textContent = msg || "";
  }

  convertBtn.addEventListener("click", () => {
    showError("");
    try {
      if (direction.value === "json2yaml") {
        output.value = yaml.dump(JSON.parse(input.value));
      } else {
        output.value = JSON.stringify(yaml.load(input.value), null, 2);
      }
    } catch (err) {
      showError(`Couldn't convert: ${err.message}`);
      output.value = "";
    }
  });

  copyBtn.addEventListener("click", () => navigator.clipboard.writeText(output.value));
  downloadBtn.addEventListener("click", () => {
    const ext = direction.value === "json2yaml" ? "yaml" : "json";
    downloadBlob(new Blob([output.value], { type: "text/plain" }), `converted.${ext}`);
  });

  container.append(
    card("Direction", [direction]),
    card("Input", [input]),
    el("div", { class: "row" }, [convertBtn, copyBtn, downloadBtn]),
    errorBox,
    card("Output", [output]),
  );
}
