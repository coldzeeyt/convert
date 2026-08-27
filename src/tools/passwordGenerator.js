import { el, card } from "../helpers.js";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}?",
};

function randomInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function generate(length, opts) {
  let pool = "";
  if (opts.lower) pool += SETS.lower;
  if (opts.upper) pool += SETS.upper;
  if (opts.digits) pool += SETS.digits;
  if (opts.symbols) pool += SETS.symbols;
  if (!pool) return "";
  let out = "";
  for (let i = 0; i < length; i++) out += pool[randomInt(pool.length)];
  return out;
}

function strengthLabel(length, opts) {
  const poolSize = (opts.lower ? 26 : 0) + (opts.upper ? 26 : 0) + (opts.digits ? 10 : 0) + (opts.symbols ? SETS.symbols.length : 0);
  const bits = length * Math.log2(poolSize || 1);
  if (bits < 40) return "Weak";
  if (bits < 60) return "Okay";
  if (bits < 80) return "Strong";
  return "Very strong";
}

export function render(container) {
  const lengthInput = el("input", { type: "number", value: "16", min: "4", max: "128" });
  const lowerCb = el("input", { type: "checkbox", checked: "checked" });
  const upperCb = el("input", { type: "checkbox", checked: "checked" });
  const digitsCb = el("input", { type: "checkbox", checked: "checked" });
  const symbolsCb = el("input", { type: "checkbox" });
  const output = el("input", { type: "text", readonly: "readonly", style: "font-family:monospace;font-size:16px" });
  const strength = el("div", { class: "hint" });
  const genBtn = el("button", {}, ["Generate"]);
  const copyBtn = el("button", { class: "secondary" }, ["Copy"]);

  function opts() {
    return { lower: lowerCb.checked, upper: upperCb.checked, digits: digitsCb.checked, symbols: symbolsCb.checked };
  }

  function run() {
    const length = Math.min(128, Math.max(4, parseInt(lengthInput.value, 10) || 16));
    output.value = generate(length, opts());
    strength.textContent = `Strength: ${strengthLabel(length, opts())}`;
  }

  genBtn.addEventListener("click", run);
  copyBtn.addEventListener("click", () => navigator.clipboard.writeText(output.value));
  run();

  container.append(
    card("Password Generator", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Length"]), lengthInput]),
      ]),
      el("div", { class: "row", style: "margin-top:10px" }, [
        el("label", { style: "display:flex;gap:6px;align-items:center" }, [lowerCb, "lowercase"]),
        el("label", { style: "display:flex;gap:6px;align-items:center" }, [upperCb, "UPPERCASE"]),
        el("label", { style: "display:flex;gap:6px;align-items:center" }, [digitsCb, "digits"]),
        el("label", { style: "display:flex;gap:6px;align-items:center" }, [symbolsCb, "symbols"]),
      ]),
      el("div", { class: "row", style: "margin-top:14px" }, [genBtn, copyBtn]),
      el("div", { style: "margin-top:12px" }, [output]),
      strength,
    ]),
  );
}
