import { el, card } from "../helpers.js";

export function render(container) {
  const textarea = el("textarea", { rows: "14", placeholder: "Paste or type your text..." });
  const stats = el("div", { class: "grid-3" });

  function tile(num, label) {
    return el("div", { class: "stat-tile" }, [el("div", { class: "num" }, [String(num)]), el("div", { class: "lbl" }, [label])]);
  }

  function compute() {
    const text = textarea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));

    stats.replaceChildren(
      tile(words, "Words"),
      tile(chars, "Characters"),
      tile(charsNoSpaces, "Chars (no spaces)"),
      tile(sentences, "Sentences"),
      tile(paragraphs, "Paragraphs"),
      tile(`${readingMinutes} min`, "Reading time"),
    );
  }

  textarea.addEventListener("input", compute);
  compute();

  container.append(card("Word & Character Counter", [textarea, stats]));
}
