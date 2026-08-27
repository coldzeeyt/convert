export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const child of [].concat(children)) {
    if (child === undefined || child === null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let val = bytes;
  let i = -1;
  do { val /= 1024; i++; } while (val >= 1024 && i < units.length - 1);
  return `${val.toFixed(1)} ${units[i]}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function outputLink(container, blob, filename, label = "Download result") {
  const url = URL.createObjectURL(blob);
  const link = el("a", {
    class: "output-link",
    href: url,
    download: filename,
  }, [`⬇ ${label} — ${filename} (${formatBytes(blob.size)})`]);
  container.append(link);
  return link;
}

export function replaceExt(filename, newExt) {
  const dot = filename.lastIndexOf(".");
  const base = dot > -1 ? filename.slice(0, dot) : filename;
  return `${base}.${newExt}`;
}

export function makeDropzone({ accept = "*", multiple = false, onFiles, hint }) {
  const input = el("input", {
    type: "file",
    accept,
    style: "display:none",
    ...(multiple ? { multiple: "multiple" } : {}),
  });
  const zone = el("div", { class: "dropzone" }, [
    el("div", {}, ["📁 Click to choose file" + (multiple ? "s" : "") + ", or drag & drop here"]),
    hint ? el("div", { class: "hint" }, [hint]) : null,
  ]);
  input.addEventListener("change", () => {
    if (input.files.length) onFiles(Array.from(input.files));
  });
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag");
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  });
  const wrap = el("div", {}, [zone, input]);
  return wrap;
}

export function progressBar() {
  const inner = el("div");
  const bar = el("div", { class: "progress-bar" }, [inner]);
  return {
    el: bar,
    set(pct) { inner.style.width = `${Math.max(0, Math.min(100, pct))}%`; },
  };
}

export function logBox() {
  const box = el("div", { class: "log" });
  return {
    el: box,
    write(line) {
      box.textContent += (box.textContent ? "\n" : "") + line;
      box.scrollTop = box.scrollHeight;
    },
    clear() { box.textContent = ""; },
  };
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsText(file);
  });
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function pageHeader(title, desc) {
  return el("div", { class: "page-header" }, [
    el("h1", {}, [title]),
    desc ? el("p", {}, [desc]) : null,
  ]);
}

export function card(titleText, children) {
  return el("div", { class: "card" }, [
    titleText ? el("h2", {}, [titleText]) : null,
    ...[].concat(children),
  ]);
}
