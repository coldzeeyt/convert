import QRCode from "qrcode";
import { el, card, outputLink } from "../helpers.js";

export function render(container) {
  const input = el("textarea", { rows: "3", placeholder: "Text or URL to encode..." });
  const sizeInput = el("input", { type: "number", value: "300", min: "100", max: "1000" });
  const genBtn = el("button", {}, ["Generate QR code"]);
  const preview = el("div");
  const outputArea = el("div");

  genBtn.addEventListener("click", async () => {
    if (!input.value.trim()) return;
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, input.value, { width: parseInt(sizeInput.value, 10) || 300, margin: 2 });
    preview.replaceChildren(canvas);
    canvas.toBlob((blob) => {
      outputArea.replaceChildren();
      outputLink(outputArea, blob, "qrcode.png");
    });
  });

  container.append(
    card("QR Code Generator", [
      el("div", { class: "col" }, [el("label", {}, ["Content"]), input]),
      el("div", { class: "row", style: "margin-top:12px" }, [
        el("div", { class: "col" }, [el("label", {}, ["Size (px)"]), sizeInput]),
      ]),
      el("div", { class: "row", style: "margin-top:12px" }, [genBtn]),
      preview,
      outputArea,
    ]),
  );
}
