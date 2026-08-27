import { el, card, makeDropzone, progressBar, logBox, outputLink, replaceExt, formatBytes } from "../helpers.js";
import { convertWithFFmpeg } from "./ffmpegClient.js";

// targets: [{ ext, label, args: (inName, outName) => string[] }]
export function renderMediaConverter(container, { accept, targets, hint, extraNotice }) {
  let currentFile = null;

  const fileInfo = el("div", { class: "hint" }, ["No file selected yet."]);
  const select = el("select", {}, targets.map((t) => el("option", { value: t.ext }, [t.label])));
  const convertBtn = el("button", { disabled: "disabled" }, ["Convert"]);
  const progress = progressBar();
  const log = logBox();
  const outputArea = el("div");

  const dropzone = makeDropzone({
    accept,
    onFiles: (files) => {
      currentFile = files[0];
      fileInfo.textContent = `Selected: ${currentFile.name} (${formatBytes(currentFile.size)})`;
      convertBtn.removeAttribute("disabled");
      outputArea.replaceChildren();
    },
    hint,
  });

  convertBtn.addEventListener("click", async () => {
    if (!currentFile) return;
    const target = targets.find((t) => t.ext === select.value);
    convertBtn.setAttribute("disabled", "disabled");
    log.clear();
    log.write("Loading converter engine (first time only, ~30MB)...");
    progress.set(0);
    outputArea.replaceChildren();
    try {
      const outName = replaceExt(currentFile.name, target.ext);
      const blob = await convertWithFFmpeg(currentFile, outName, target.args, {
        onProgress: (p) => progress.set(p),
        onLog: (line) => log.write(line),
      });
      progress.set(100);
      log.write("Done.");
      outputLink(outputArea, blob, outName);
    } catch (err) {
      log.write(`Error: ${err.message || err}`);
    } finally {
      convertBtn.removeAttribute("disabled");
    }
  });

  container.append(
    card("1. Choose a file", [dropzone, fileInfo]),
    card("2. Pick output format", [
      el("div", { class: "row" }, [select, convertBtn]),
    ]),
    card("3. Result", [progress.el, log.el, outputArea]),
    extraNotice ? el("div", { class: "notice" }, [extraNotice]) : null,
  );
}
