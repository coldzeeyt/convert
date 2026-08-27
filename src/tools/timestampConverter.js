import { el, card } from "../helpers.js";

export function render(container) {
  const timestampInput = el("input", { type: "number", placeholder: "e.g. 1735689600" });
  const unitSelect = el("select", {}, [
    el("option", { value: "s" }, ["Seconds"]),
    el("option", { value: "ms" }, ["Milliseconds"]),
  ]);
  const dateInput = el("input", { type: "datetime-local", step: "1" });
  const nowBtn = el("button", { class: "secondary" }, ["Use current time"]);
  const resultBox = el("div", { class: "col" });
  const errorBox = el("div", { class: "notice warn", style: "display:none" });

  function showResult(date) {
    errorBox.style.display = "none";
    resultBox.replaceChildren(
      el("div", { class: "hint" }, [`UTC: ${date.toUTCString()}`]),
      el("div", { class: "hint" }, [`Local: ${date.toString()}`]),
      el("div", { class: "hint" }, [`ISO 8601: ${date.toISOString()}`]),
    );
  }

  function fromTimestamp() {
    const raw = parseFloat(timestampInput.value);
    if (Number.isNaN(raw)) return;
    const ms = unitSelect.value === "s" ? raw * 1000 : raw;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) { errorBox.style.display = "block"; errorBox.textContent = "That's not a valid timestamp."; return; }
    dateInput.value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    showResult(date);
  }

  function fromDate() {
    if (!dateInput.value) return;
    const date = new Date(dateInput.value);
    if (Number.isNaN(date.getTime())) return;
    timestampInput.value = unitSelect.value === "s" ? Math.floor(date.getTime() / 1000) : date.getTime();
    showResult(date);
  }

  nowBtn.addEventListener("click", () => {
    const now = new Date();
    timestampInput.value = unitSelect.value === "s" ? Math.floor(now.getTime() / 1000) : now.getTime();
    fromTimestamp();
  });

  timestampInput.addEventListener("input", fromTimestamp);
  unitSelect.addEventListener("change", fromTimestamp);
  dateInput.addEventListener("input", fromDate);

  container.append(
    card("Unix Timestamp ⇄ Date", [
      el("div", { class: "row" }, [
        el("div", { class: "col" }, [el("label", {}, ["Timestamp"]), timestampInput]),
        el("div", { class: "col" }, [el("label", {}, ["Unit"]), unitSelect]),
        el("div", { class: "col" }, [el("label", {}, ["Date & time (your local zone)"]), dateInput]),
      ]),
      el("div", { class: "row", style: "margin-top:12px" }, [nowBtn]),
      errorBox,
      el("div", { style: "margin-top:12px" }, [resultBox]),
    ]),
  );
}
