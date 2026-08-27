import { el, card } from "../helpers.js";

function diffLines(a, b) {
  const la = a.split("\n"), lb = b.split("\n");
  const n = la.length, m = lb.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = la[i] === lb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (la[i] === lb[j]) { out.push({ type: "same", text: la[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: "removed", text: la[i] }); i++; }
    else { out.push({ type: "added", text: lb[j] }); j++; }
  }
  while (i < n) { out.push({ type: "removed", text: la[i] }); i++; }
  while (j < m) { out.push({ type: "added", text: lb[j] }); j++; }
  return out;
}

export function render(container) {
  const left = el("textarea", { rows: "12", placeholder: "Original text..." });
  const right = el("textarea", { rows: "12", placeholder: "Changed text..." });
  const compareBtn = el("button", {}, ["Compare"]);
  const result = el("div", { class: "log", style: "max-height:400px" });

  compareBtn.addEventListener("click", () => {
    const diff = diffLines(left.value, right.value);
    result.replaceChildren();
    for (const line of diff) {
      const colors = { same: "var(--text-dim)", added: "var(--accent-2)", removed: "var(--danger)" };
      const prefix = { same: "  ", added: "+ ", removed: "- " };
      result.append(el("div", { style: `color:${colors[line.type]}` }, [prefix[line.type] + line.text]));
    }
  });

  container.append(
    card("Text Diff Checker", [
      el("div", { class: "grid-2" }, [
        el("div", { class: "col" }, [el("label", {}, ["Original"]), left]),
        el("div", { class: "col" }, [el("label", {}, ["Changed"]), right]),
      ]),
      el("div", { class: "row", style: "margin:12px 0" }, [compareBtn]),
      result,
    ]),
  );
}
