import { el, card } from "../helpers.js";

const CATEGORIES = {
  length: {
    label: "Length",
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  },
  weight: {
    label: "Weight",
    units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125, ton: 1000 },
  },
  volume: {
    label: "Volume",
    units: { l: 1, ml: 0.001, "gal (US)": 3.785411784, qt: 0.946352946, cup: 0.2365882365, "fl oz": 0.0295735295625 },
  },
  temperature: { label: "Temperature", units: { C: "C", F: "F", K: "K" } },
};

function convertTemp(value, from, to) {
  let celsius;
  if (from === "C") celsius = value;
  else if (from === "F") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  if (to === "C") return celsius;
  if (to === "F") return celsius * (9 / 5) + 32;
  return celsius + 273.15;
}

export function render(container) {
  const categorySelect = el("select", {}, Object.entries(CATEGORIES).map(([k, v]) => el("option", { value: k }, [v.label])));
  const fromSelect = el("select");
  const toSelect = el("select");
  const valueInput = el("input", { type: "number", value: "1" });
  const resultBox = el("div", { class: "stat-tile" }, [el("div", { class: "num" }, ["—"]), el("div", { class: "lbl" }, ["Result"])]);

  function populateUnits() {
    const units = Object.keys(CATEGORIES[categorySelect.value].units);
    fromSelect.replaceChildren(...units.map((u) => el("option", { value: u }, [u])));
    toSelect.replaceChildren(...units.map((u) => el("option", { value: u }, [u])));
    toSelect.selectedIndex = units.length > 1 ? 1 : 0;
    compute();
  }

  function compute() {
    const cat = CATEGORIES[categorySelect.value];
    const value = parseFloat(valueInput.value);
    if (Number.isNaN(value)) return;
    let result;
    if (categorySelect.value === "temperature") {
      result = convertTemp(value, fromSelect.value, toSelect.value);
    } else {
      const meters = value * cat.units[fromSelect.value];
      result = meters / cat.units[toSelect.value];
    }
    resultBox.firstChild.textContent = Number(result.toPrecision(8)).toString();
  }

  categorySelect.addEventListener("change", populateUnits);
  [fromSelect, toSelect, valueInput].forEach((elm) => elm.addEventListener("input", compute));

  populateUnits();

  container.append(
    card("Unit Converter", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Category"]), categorySelect]),
      ]),
      el("div", { class: "row", style: "margin-top:12px" }, [
        el("div", { class: "col" }, [el("label", {}, ["Value"]), valueInput]),
        el("div", { class: "col" }, [el("label", {}, ["From"]), fromSelect]),
        el("div", { class: "col" }, [el("label", {}, ["To"]), toSelect]),
      ]),
      el("div", { style: "margin-top:16px;max-width:220px" }, [resultBox]),
    ]),
  );
}
