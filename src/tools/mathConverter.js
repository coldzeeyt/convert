import { el, card } from "../helpers.js";

const ROMAN_TABLE = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num) {
  if (!Number.isInteger(num) || num < 1 || num > 3999) return null;
  let result = "";
  let n = num;
  for (const [value, symbol] of ROMAN_TABLE) {
    while (n >= value) { result += symbol; n -= value; }
  }
  return result;
}

function fromRoman(str) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const s = str.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]], next = map[s[i + 1]];
    total += next > cur ? -cur : cur;
  }
  return toRoman(total) === s ? total : null; // reject non-canonical forms like "IIII"
}

function romanSection() {
  const numberInput = el("input", { type: "number", min: "1", max: "3999", placeholder: "e.g. 1994" });
  const romanInput = el("input", { type: "text", placeholder: "e.g. MCMXCIV" });
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  function fromNumber() {
    errorBox.style.display = "none";
    const n = parseInt(numberInput.value, 10);
    if (Number.isNaN(n)) { romanInput.value = ""; return; }
    const roman = toRoman(n);
    if (!roman) { errorBox.style.display = "block"; errorBox.textContent = "Roman numerals only go from 1 to 3999."; romanInput.value = ""; return; }
    romanInput.value = roman;
  }
  function fromRomanInput() {
    errorBox.style.display = "none";
    if (!romanInput.value.trim()) { numberInput.value = ""; return; }
    const n = fromRoman(romanInput.value);
    if (n === null) { errorBox.style.display = "block"; errorBox.textContent = "That doesn't look like a valid Roman numeral."; numberInput.value = ""; return; }
    numberInput.value = String(n);
  }

  numberInput.addEventListener("input", fromNumber);
  romanInput.addEventListener("input", fromRomanInput);

  return card("Roman Numeral ⇄ Number", [
    el("div", { class: "row" }, [
      el("div", { class: "col" }, [el("label", {}, ["Number (1–3999)"]), numberInput]),
      el("div", { class: "col" }, [el("label", {}, ["Roman numeral"]), romanInput]),
    ]),
    errorBox,
  ]);
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function fractionSection() {
  const numInput = el("input", { type: "number", value: "1", style: "width:80px" });
  const denInput = el("input", { type: "number", value: "2", style: "width:80px" });
  const decimalInput = el("input", { type: "text", readonly: "readonly" });
  const percentInput = el("input", { type: "text", readonly: "readonly" });
  const simplifiedBox = el("div", { class: "hint" });

  function compute() {
    const n = parseFloat(numInput.value), d = parseFloat(denInput.value);
    if (!d) { decimalInput.value = ""; percentInput.value = ""; return; }
    const value = n / d;
    decimalInput.value = Number(value.toPrecision(10)).toString();
    percentInput.value = `${Number((value * 100).toPrecision(10))}%`;
    const g = gcd(Math.round(n), Math.round(d)) || 1;
    simplifiedBox.textContent = `Simplified: ${Math.round(n) / g}/${Math.round(d) / g}`;
  }

  [numInput, denInput].forEach((i) => i.addEventListener("input", compute));
  compute();

  return card("Fraction ⇄ Decimal ⇄ Percent", [
    el("div", { class: "row" }, [
      el("div", { class: "col" }, [el("label", {}, ["Numerator"]), numInput]),
      el("span", { style: "align-self:flex-end;padding-bottom:8px;font-size:20px" }, ["/"]),
      el("div", { class: "col" }, [el("label", {}, ["Denominator"]), denInput]),
    ]),
    el("div", { class: "row", style: "margin-top:12px" }, [
      el("div", { class: "col" }, [el("label", {}, ["Decimal"]), decimalInput]),
      el("div", { class: "col" }, [el("label", {}, ["Percent"]), percentInput]),
    ]),
    simplifiedBox,
  ]);
}

export function render(container) {
  container.append(romanSection(), fractionSection());
}
