import { el, card, makeDropzone, outputLink, readFileAsArrayBuffer } from "../helpers.js";

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function render(container) {
  const textInput = el("textarea", { rows: "6", placeholder: "Type or paste text..." });
  const textOutput = el("textarea", { rows: "6", readonly: "readonly" });
  const encodeBtn = el("button", {}, ["Encode → Base64"]);
  const decodeBtn = el("button", { class: "secondary" }, ["Decode ← Base64"]);
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  encodeBtn.addEventListener("click", () => {
    errorBox.style.display = "none";
    textOutput.value = btoa(unescape(encodeURIComponent(textInput.value)));
  });
  decodeBtn.addEventListener("click", () => {
    try {
      errorBox.style.display = "none";
      textOutput.value = decodeURIComponent(escape(atob(textInput.value.trim())));
    } catch {
      errorBox.style.display = "block";
      errorBox.textContent = "That doesn't look like valid Base64.";
    }
  });

  const fileOutput = el("div");
  const dropzone = makeDropzone({
    accept: "*",
    onFiles: async (files) => {
      const file = files[0];
      const bytes = new Uint8Array(await readFileAsArrayBuffer(file));
      const b64 = bytesToBase64(bytes);
      const blob = new Blob([b64], { type: "text/plain" });
      fileOutput.replaceChildren();
      outputLink(fileOutput, blob, `${file.name}.base64.txt`, "Download Base64 text");
    },
    hint: "Encode any file (image, PDF, etc.) to a Base64 text file",
  });

  container.append(
    card("Base64 — Text", [
      textInput,
      el("div", { class: "row", style: "margin:12px 0" }, [encodeBtn, decodeBtn]),
      errorBox,
      textOutput,
    ]),
    card("Base64 — File", [dropzone, fileOutput]),
  );
}
