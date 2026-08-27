import { el, card } from "../helpers.js";

export function render(container) {
  const author = el("input", { type: "text", placeholder: "Last, First (e.g. Smith, Jane)" });
  const title = el("input", { type: "text", placeholder: "Title of the page/article/book" });
  const siteName = el("input", { type: "text", placeholder: "Website or publisher name" });
  const year = el("input", { type: "text", placeholder: "Year (e.g. 2024)" });
  const url = el("input", { type: "text", placeholder: "URL (optional)" });
  const accessDate = el("input", { type: "text", placeholder: "Date accessed, e.g. 27 Aug. 2026 (optional)" });
  const output = el("textarea", { rows: "5", readonly: "readonly" });
  const genBtn = el("button", {}, ["Generate citations"]);
  const copyBtn = el("button", { class: "secondary" }, ["Copy APA"]);

  function apa() {
    const a = author.value.trim();
    const y = year.value.trim() || "n.d.";
    const t = title.value.trim();
    const s = siteName.value.trim();
    const u = url.value.trim();
    let out = "";
    if (a) out += `${a}. `;
    out += `(${y}). ${t}${t && !t.endsWith(".") ? "." : ""}`;
    if (s) out += ` ${s}.`;
    if (u) out += ` ${u}`;
    return out.trim();
  }

  function mla() {
    const a = author.value.trim();
    const t = title.value.trim();
    const s = siteName.value.trim();
    const y = year.value.trim();
    const u = url.value.trim();
    const acc = accessDate.value.trim();
    let out = "";
    if (a) out += `${a}. `;
    out += `"${t}." `;
    if (s) out += `${s}, `;
    if (y) out += `${y}, `;
    if (u) out += `${u}. `;
    if (acc) out += `Accessed ${acc}.`;
    return out.trim();
  }

  genBtn.addEventListener("click", () => {
    output.value = `APA:\n${apa()}\n\nMLA:\n${mla()}`;
  });
  copyBtn.addEventListener("click", () => navigator.clipboard.writeText(apa()));

  container.append(
    card("Citation Generator (APA / MLA — website or book)", [
      el("div", { class: "grid-2" }, [
        el("div", { class: "col" }, [el("label", {}, ["Author"]), author]),
        el("div", { class: "col" }, [el("label", {}, ["Title"]), title]),
        el("div", { class: "col" }, [el("label", {}, ["Website / Publisher"]), siteName]),
        el("div", { class: "col" }, [el("label", {}, ["Year"]), year]),
        el("div", { class: "col" }, [el("label", {}, ["URL"]), url]),
        el("div", { class: "col" }, [el("label", {}, ["Date accessed"]), accessDate]),
      ]),
      el("div", { class: "row", style: "margin:14px 0" }, [genBtn, copyBtn]),
      output,
      el("div", { class: "hint" }, ["A quick starting point — always double-check against your teacher's required style guide."]),
    ]),
  );
}
