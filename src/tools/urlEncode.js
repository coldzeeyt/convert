import { el, card } from "../helpers.js";

export function render(container) {
  const input = el("textarea", { rows: "6", placeholder: "Type or paste text / URL..." });
  const output = el("textarea", { rows: "6", readonly: "readonly" });
  const encodeBtn = el("button", {}, ["Encode"]);
  const decodeBtn = el("button", { class: "secondary" }, ["Decode"]);
  const componentToggle = el("input", { type: "checkbox", checked: "checked" });

  encodeBtn.addEventListener("click", () => {
    output.value = componentToggle.checked ? encodeURIComponent(input.value) : encodeURI(input.value);
  });
  decodeBtn.addEventListener("click", () => {
    try {
      output.value = componentToggle.checked ? decodeURIComponent(input.value) : decodeURI(input.value);
    } catch {
      output.value = "Invalid encoded input.";
    }
  });

  container.append(
    card("URL Encode / Decode", [
      input,
      el("div", { class: "row", style: "margin:12px 0" }, [
        encodeBtn, decodeBtn,
        el("label", { style: "display:flex;align-items:center;gap:6px" }, [componentToggle, "Use encodeURIComponent (escape reserved chars like & and =)"]),
      ]),
      output,
    ]),
  );
}
