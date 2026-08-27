import { el, card } from "../helpers.js";

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function stopwatchSection() {
  let startTime = 0, elapsed = 0, running = false, raf;
  const display = el("div", { style: "font-size:40px;font-family:monospace;text-align:center;margin:10px 0" }, ["0:00.00"]);
  const startBtn = el("button", {}, ["Start"]);
  const lapBtn = el("button", { class: "secondary", disabled: "disabled" }, ["Lap"]);
  const resetBtn = el("button", { class: "secondary" }, ["Reset"]);
  const laps = el("ol");

  function tick() {
    if (!running) return;
    display.textContent = formatMs(elapsed + (performance.now() - startTime));
    raf = requestAnimationFrame(tick);
  }

  startBtn.addEventListener("click", () => {
    if (running) {
      running = false;
      elapsed += performance.now() - startTime;
      cancelAnimationFrame(raf);
      startBtn.textContent = "Resume";
      lapBtn.setAttribute("disabled", "disabled");
    } else {
      running = true;
      startTime = performance.now();
      startBtn.textContent = "Pause";
      lapBtn.removeAttribute("disabled");
      tick();
    }
  });

  lapBtn.addEventListener("click", () => {
    laps.append(el("li", {}, [formatMs(elapsed + (performance.now() - startTime))]));
  });

  resetBtn.addEventListener("click", () => {
    running = false;
    elapsed = 0;
    cancelAnimationFrame(raf);
    display.textContent = "0:00.00";
    startBtn.textContent = "Start";
    lapBtn.setAttribute("disabled", "disabled");
    laps.replaceChildren();
  });

  return card("Stopwatch", [display, el("div", { class: "row", style: "justify-content:center" }, [startBtn, lapBtn, resetBtn]), laps]);
}

function timerSection() {
  let remaining = 0, interval = null;
  const minutesInput = el("input", { type: "number", value: "5", min: "1", max: "180" });
  const display = el("div", { style: "font-size:40px;font-family:monospace;text-align:center;margin:10px 0" }, ["05:00"]);
  const startBtn = el("button", {}, ["Start"]);
  const resetBtn = el("button", { class: "secondary" }, ["Reset"]);
  const doneMsg = el("div", { class: "notice", style: "display:none;text-align:center" }, ["⏰ Time's up!"]);

  function render() {
    const m = Math.floor(remaining / 60), s = remaining % 60;
    display.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function reset() {
    clearInterval(interval);
    interval = null;
    remaining = (parseInt(minutesInput.value, 10) || 5) * 60;
    doneMsg.style.display = "none";
    startBtn.textContent = "Start";
    render();
  }

  startBtn.addEventListener("click", () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
      startBtn.textContent = "Resume";
      return;
    }
    if (remaining <= 0) remaining = (parseInt(minutesInput.value, 10) || 5) * 60;
    doneMsg.style.display = "none";
    startBtn.textContent = "Pause";
    interval = setInterval(() => {
      remaining -= 1;
      render();
      if (remaining <= 0) {
        clearInterval(interval);
        interval = null;
        doneMsg.style.display = "block";
        startBtn.textContent = "Start";
      }
    }, 1000);
  });

  resetBtn.addEventListener("click", reset);
  reset();

  return card("Countdown Timer / Pomodoro", [
    el("div", { class: "row" }, [
      el("div", { class: "col" }, [el("label", {}, ["Minutes"]), minutesInput]),
    ]),
    display,
    el("div", { class: "row", style: "justify-content:center" }, [startBtn, resetBtn]),
    doneMsg,
    el("div", { class: "hint" }, ["Tip: set 25 minutes for a Pomodoro focus block, then 5 for a break."]),
  ]);
}

export function render(container) {
  container.append(stopwatchSection(), timerSection());
}
