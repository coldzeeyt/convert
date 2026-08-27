import { el, card } from "../helpers.js";

const BASES = { Binary: 2, Octal: 8, Decimal: 10, Hexadecimal: 16 };

export function render(container) {
  const inputs = {};
  const rows = Object.entries(BASES).map(([label, base]) => {
    const input = el("input", { type: "text", placeholder: label });
    inputs[base] = input;
    input.addEventListener("input", () => sync(base));
    return el("div", { class: "col" }, [el("label", {}, [`${label} (base ${base})`]), input]);
  });

  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  function sync(sourceBase) {
    errorBox.style.display = "none";
    const raw = inputs[sourceBase].value.trim();
    if (!raw) { Object.values(inputs).forEach((i) => { if (i !== inputs[sourceBase]) i.value = ""; }); return; }
    const value = parseInt(raw, sourceBase);
    if (Number.isNaN(value)) {
      errorBox.style.display = "block";
      errorBox.textContent = `"${raw}" isn't valid in base ${sourceBase}.`;
      return;
    }
    for (const [base, input] of Object.entries(inputs)) {
      if (Number(base) !== sourceBase) input.value = value.toString(Number(base)).toUpperCase();
    }
  }

  inputs[10].value = "42";
  sync(10);

  container.append(
    card("Number Base Converter", [
      el("div", { class: "grid-2" }, rows),
      errorBox,
      el("div", { class: "hint", style: "margin-top:10px" }, ["Type in any field — the others update automatically."]),
    ]),
  );
}
