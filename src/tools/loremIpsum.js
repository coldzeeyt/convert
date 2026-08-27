import { el, card } from "../helpers.js";

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function randWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

function sentence() {
  const len = 6 + Math.floor(Math.random() * 10);
  const words = Array.from({ length: len }, randWord);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function paragraph() {
  const count = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, sentence).join(" ");
}

export function render(container) {
  const countInput = el("input", { type: "number", value: "3", min: "1", max: "50" });
  const unitSelect = el("select", {}, [
    el("option", { value: "paragraphs" }, ["Paragraphs"]),
    el("option", { value: "sentences" }, ["Sentences"]),
    el("option", { value: "words" }, ["Words"]),
  ]);
  const output = el("textarea", { rows: "14", readonly: "readonly" });
  const genBtn = el("button", {}, ["Generate"]);
  const copyBtn = el("button", { class: "secondary" }, ["Copy"]);

  genBtn.addEventListener("click", () => {
    const n = Math.max(1, parseInt(countInput.value, 10) || 1);
    if (unitSelect.value === "paragraphs") output.value = Array.from({ length: n }, paragraph).join("\n\n");
    else if (unitSelect.value === "sentences") output.value = Array.from({ length: n }, sentence).join(" ");
    else output.value = Array.from({ length: n }, randWord).join(" ");
  });
  copyBtn.addEventListener("click", () => navigator.clipboard.writeText(output.value));
  genBtn.click();

  container.append(
    card("Lorem Ipsum Generator", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Count"]), countInput]),
        el("div", { class: "col" }, [el("label", {}, ["Unit"]), unitSelect]),
      ]),
      el("div", { class: "row", style: "margin:12px 0" }, [genBtn, copyBtn]),
      output,
    ]),
  );
}
