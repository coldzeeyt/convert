import { el, card } from "../helpers.js";

function randomInt(min, max) {
  const range = max - min + 1;
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return min + (arr[0] % range);
}

function numberSection() {
  const minInput = el("input", { type: "number", value: "1" });
  const maxInput = el("input", { type: "number", value: "100" });
  const resultBox = el("div", { class: "stat-tile" }, [el("div", { class: "num" }, ["—"]), el("div", { class: "lbl" }, ["Result"])]);
  const genBtn = el("button", {}, ["Generate"]);

  genBtn.addEventListener("click", () => {
    const min = parseInt(minInput.value, 10) || 0;
    const max = parseInt(maxInput.value, 10) || 100;
    resultBox.firstChild.textContent = String(randomInt(Math.min(min, max), Math.max(min, max)));
  });

  return card("Random Number", [
    el("div", { class: "row" }, [
      el("div", { class: "col" }, [el("label", {}, ["Min"]), minInput]),
      el("div", { class: "col" }, [el("label", {}, ["Max"]), maxInput]),
    ]),
    el("div", { class: "row", style: "margin-top:12px" }, [genBtn]),
    el("div", { style: "margin-top:12px;max-width:200px" }, [resultBox]),
  ]);
}

function pickerSection() {
  const listInput = el("textarea", { rows: "6", placeholder: "One option per line (names for group picking, tasks, etc.)" });
  const resultBox = el("div", { class: "stat-tile" }, [el("div", { class: "num" }, ["—"]), el("div", { class: "lbl" }, ["Picked"])]);
  const pickBtn = el("button", {}, ["Pick one at random"]);
  const shuffleBtn = el("button", { class: "secondary" }, ["Shuffle whole list"]);
  const output = el("textarea", { rows: "6", readonly: "readonly" });

  function options() {
    return listInput.value.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  pickBtn.addEventListener("click", () => {
    const opts = options();
    if (!opts.length) return;
    resultBox.firstChild.textContent = opts[randomInt(0, opts.length - 1)];
  });

  shuffleBtn.addEventListener("click", () => {
    const opts = options();
    for (let i = opts.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    output.value = opts.join("\n");
  });

  return card("Random Picker / Shuffler", [
    listInput,
    el("div", { class: "row", style: "margin:12px 0" }, [pickBtn, shuffleBtn]),
    el("div", { style: "max-width:260px;margin-bottom:12px" }, [resultBox]),
    output,
  ]);
}

export function render(container) {
  container.append(numberSection(), pickerSection());
}
