import { el, card } from "../helpers.js";

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function render(container) {
  const picker = el("input", { type: "color", value: "#6ea8fe" });
  const hexInput = el("input", { type: "text", value: "#6ea8fe" });
  const rgbInput = el("input", { type: "text", readonly: "readonly" });
  const hslInput = el("input", { type: "text", readonly: "readonly" });
  const swatch = el("div", { class: "swatch" });

  function update(hex) {
    if (!/^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    picker.value = rgbToHex(rgb);
    hexInput.value = hex;
    rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    swatch.style.background = hex;
  }

  picker.addEventListener("input", () => update(picker.value));
  hexInput.addEventListener("input", () => update(hexInput.value));

  update("#6ea8fe");

  container.append(
    card("Color Converter", [
      el("div", { class: "row" }, [picker, hexInput]),
      swatch,
      el("div", { class: "row", style: "margin-top:12px" }, [
        el("div", { class: "col" }, [el("label", {}, ["RGB"]), rgbInput]),
        el("div", { class: "col" }, [el("label", {}, ["HSL"]), hslInput]),
      ]),
    ]),
  );
}
