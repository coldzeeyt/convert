import JSZip from "jszip";
import { el, card, makeDropzone, outputLink, formatBytes, downloadBlob } from "../helpers.js";

function zipSection() {
  let files = [];
  const fileList = el("ul", { class: "file-list" });
  const zipBtn = el("button", { disabled: "disabled" }, ["Create ZIP"]);
  const nameInput = el("input", { type: "text", value: "archive.zip" });
  const outputArea = el("div");

  function renderList() {
    fileList.replaceChildren(...files.map((f, idx) =>
      el("li", {}, [
        f.name,
        el("div", { class: "row" }, [
          el("span", { class: "meta" }, [formatBytes(f.size)]),
          el("button", { class: "secondary", onclick: () => { files.splice(idx, 1); renderList(); } }, ["Remove"]),
        ]),
      ])));
    if (files.length) zipBtn.removeAttribute("disabled");
    else zipBtn.setAttribute("disabled", "disabled");
  }

  const dropzone = makeDropzone({
    accept: "*",
    multiple: true,
    onFiles: (newFiles) => { files = files.concat(newFiles); renderList(); },
    hint: "Add as many files as you like",
  });

  zipBtn.addEventListener("click", async () => {
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f);
    const blob = await zip.generateAsync({ type: "blob" });
    outputArea.replaceChildren();
    outputLink(outputArea, blob, nameInput.value || "archive.zip");
  });

  return card("Zip files together", [
    dropzone,
    fileList,
    el("div", { class: "row", style: "margin-top:12px" }, [
      el("div", { class: "col" }, [el("label", {}, ["Archive name"]), nameInput]),
    ]),
    el("div", { class: "row", style: "margin-top:12px" }, [zipBtn]),
    outputArea,
  ]);
}

function unzipSection() {
  const entriesArea = el("div");
  const downloadAllBtn = el("button", { class: "secondary", style: "display:none" }, ["Download all as individual files"]);
  let currentZip = null;

  const dropzone = makeDropzone({
    accept: ".zip,application/zip",
    onFiles: async (files) => {
      entriesArea.replaceChildren(el("div", { class: "hint" }, ["Reading archive..."]));
      const zip = await JSZip.loadAsync(files[0]);
      currentZip = zip;
      const entries = Object.values(zip.files).filter((e) => !e.dir);
      const list = el("ul", { class: "file-list" });
      for (const entry of entries) {
        const li = el("li", {}, [entry.name]);
        entry.async("blob").then((blob) => {
          const link = el("a", { class: "output-link", href: "#" }, [`⬇ ${formatBytes(blob.size)}`]);
          link.addEventListener("click", (e) => { e.preventDefault(); downloadBlob(blob, entry.name.split("/").pop()); });
          li.append(link);
        });
        list.append(li);
      }
      entriesArea.replaceChildren(list);
      downloadAllBtn.style.display = entries.length ? "inline-flex" : "none";
    },
    hint: "Browse and download files from inside a .zip",
  });

  downloadAllBtn.addEventListener("click", async () => {
    if (!currentZip) return;
    for (const entry of Object.values(currentZip.files)) {
      if (entry.dir) continue;
      const blob = await entry.async("blob");
      downloadBlob(blob, entry.name.split("/").pop());
    }
  });

  return card("Unzip / browse a ZIP", [dropzone, entriesArea, el("div", { style: "margin-top:10px" }, [downloadAllBtn])]);
}

export function render(container) {
  container.append(
    zipSection(),
    unzipSection(),
    el("div", { class: "notice" }, ["All zipping/unzipping happens locally in your browser."]),
  );
}
