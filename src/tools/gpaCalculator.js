import { el, card } from "../helpers.js";

const GRADE_POINTS = { "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, "D-": 0.7, F: 0.0 };

export function render(container) {
  const rows = el("div", { class: "col" });
  const resultBox = el("div", { class: "stat-tile" }, [el("div", { class: "num" }, ["—"]), el("div", { class: "lbl" }, ["GPA"])]);
  const addBtn = el("button", { class: "secondary" }, ["+ Add course"]);
  const computeBtn = el("button", {}, ["Calculate GPA"]);

  function addRow(name = "", credits = 3, grade = "A") {
    const nameInput = el("input", { type: "text", placeholder: "Course name", value: name, style: "flex:1" });
    const creditsInput = el("input", { type: "number", value: String(credits), min: "0", step: "0.5", style: "width:80px" });
    const gradeSelect = el("select", {}, Object.keys(GRADE_POINTS).map((g) => el("option", { value: g, ...(g === grade ? { selected: "selected" } : {}) }, [g])));
    const removeBtn = el("button", { class: "secondary" }, ["✕"]);
    const row = el("div", { class: "row" }, [nameInput, creditsInput, gradeSelect, removeBtn]);
    removeBtn.addEventListener("click", () => row.remove());
    rows.append(row);
  }

  computeBtn.addEventListener("click", () => {
    let totalPoints = 0, totalCredits = 0;
    for (const row of rows.children) {
      const [, creditsInput, gradeSelect] = row.children;
      const credits = parseFloat(creditsInput.value) || 0;
      totalPoints += credits * GRADE_POINTS[gradeSelect.value];
      totalCredits += credits;
    }
    resultBox.firstChild.textContent = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(3) : "—";
  });

  addBtn.addEventListener("click", () => addRow());
  addRow("Course 1"); addRow("Course 2");

  container.append(
    card("GPA Calculator (4.0 scale)", [
      rows,
      el("div", { class: "row", style: "margin:14px 0" }, [addBtn, computeBtn]),
      el("div", { style: "max-width:200px" }, [resultBox]),
      el("div", { class: "hint" }, ["Standard US 4.0 scale — check with your school if they use a different weighting (e.g. honors/AP bonus points)."]),
    ]),
  );
}
