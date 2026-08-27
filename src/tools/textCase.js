import { el, card } from "../helpers.js";

const transforms = {
  UPPERCASE: (s) => s.toUpperCase(),
  lowercase: (s) => s.toLowerCase(),
  "Title Case": (s) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()),
  "Sentence case": (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  camelCase: (s) => words(s).map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join(""),
  PascalCase: (s) => words(s).map(cap).join(""),
  snake_case: (s) => words(s).map((w) => w.toLowerCase()).join("_"),
  "kebab-case": (s) => words(s).map((w) => w.toLowerCase()).join("-"),
  "CONSTANT_CASE": (s) => words(s).map((w) => w.toUpperCase()).join("_"),
};

function words(s) {
  return s.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[\s_\-]+/).filter(Boolean);
}
function cap(w) { return w[0].toUpperCase() + w.slice(1).toLowerCase(); }

export function render(container) {
  const input = el("textarea", { rows: "6", placeholder: "Type or paste text..." });
  const output = el("textarea", { rows: "6", readonly: "readonly" });
  const buttons = Object.keys(transforms).map((name) => {
    const btn = el("button", { class: "secondary" }, [name]);
    btn.addEventListener("click", () => { output.value = transforms[name](input.value); });
    return btn;
  });

  container.append(
    card("Text Case Converter", [
      input,
      el("div", { class: "row", style: "margin:12px 0" }, buttons),
      output,
    ]),
  );
}
