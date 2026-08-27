import { el, card, makeDropzone, readFileAsArrayBuffer } from "../helpers.js";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashAll(bytes) {
  const results = {};
  for (const algo of ALGOS) {
    results[algo] = bufToHex(await crypto.subtle.digest(algo, bytes));
  }
  return results;
}

function resultTable(results) {
  const rows = Object.entries(results).map(([algo, hex]) =>
    el("tr", {}, [el("td", {}, [algo]), el("td", { style: "font-family:monospace;word-break:break-all" }, [hex])]));
  return el("table", { class: "result-table" }, [el("tbody", {}, rows)]);
}

export function render(container) {
  const textInput = el("textarea", { rows: "6", placeholder: "Type or paste text..." });
  const textBtn = el("button", {}, ["Hash text"]);
  const textOutput = el("div");

  textBtn.addEventListener("click", async () => {
    const bytes = new TextEncoder().encode(textInput.value);
    textOutput.replaceChildren(resultTable(await hashAll(bytes)));
  });

  const fileOutput = el("div");
  const dropzone = makeDropzone({
    accept: "*",
    onFiles: async (files) => {
      fileOutput.replaceChildren(el("div", { class: "hint" }, ["Hashing..."]));
      const buf = await readFileAsArrayBuffer(files[0]);
      fileOutput.replaceChildren(resultTable(await hashAll(buf)));
    },
    hint: "Compute checksums (SHA-1/256/384/512) for any file",
  });

  container.append(
    card("Hash Generator — Text", [textInput, el("div", { style: "margin:12px 0" }, [textBtn]), textOutput]),
    card("Hash Generator — File", [dropzone, fileOutput]),
    el("div", { class: "notice" }, ["Computed locally with the browser's Web Crypto API."]),
  );
}
