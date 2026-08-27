import { el, card } from "../helpers.js";

function extractVideoId(input) {
  const raw = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw; // bare video ID

  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") {
    return url.pathname.slice(1).split("/")[0] || null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const embedMatch = url.pathname.match(/^\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[2];
  }
  return null;
}

function parseStartSeconds(input) {
  try {
    const url = new URL(input.trim());
    const t = url.searchParams.get("t") || url.searchParams.get("start");
    if (!t) return 0;
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    const match = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!match) return 0;
    const [, h, m, s] = match;
    return (parseInt(h || "0", 10) * 3600) + (parseInt(m || "0", 10) * 60) + parseInt(s || "0", 10);
  } catch {
    return 0;
  }
}

export function render(container) {
  const input = el("input", { type: "text", placeholder: "Paste a YouTube link (or just the video ID)...", style: "flex:1" });
  const loadBtn = el("button", {}, ["Load video"]);
  const errorBox = el("div", { class: "notice warn", style: "display:none" });
  const playerWrap = el("div", {
    style: "position:relative;width:100%;aspect-ratio:16/9;border-radius:10px;overflow:hidden;border:1px solid var(--border);display:none",
  });

  function loadVideo() {
    const id = extractVideoId(input.value);
    if (!id) {
      errorBox.style.display = "block";
      errorBox.textContent = "Couldn't find a video ID in that — paste a full YouTube link (youtube.com/watch?v=..., youtu.be/..., or /shorts/...) or an 11-character video ID.";
      playerWrap.style.display = "none";
      return;
    }
    errorBox.style.display = "none";
    const start = parseStartSeconds(input.value);
    const src = `https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ""}`;
    playerWrap.replaceChildren(el("iframe", {
      src,
      style: "position:absolute;inset:0;width:100%;height:100%;border:0",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      allowfullscreen: "allowfullscreen",
      title: "YouTube video player",
    }));
    playerWrap.style.display = "block";
  }

  loadBtn.addEventListener("click", loadVideo);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") loadVideo(); });

  container.append(
    card("Paste a link to watch", [
      el("div", { class: "row" }, [input, loadBtn]),
      errorBox,
    ]),
    playerWrap,
    el("div", { class: "notice" }, [
      "This uses YouTube's own embedded player (via youtube-nocookie.com) — the video streams straight from YouTube, so it works with any public or unlisted video and respects the uploader's rights. It won't load anything that YouTube itself blocks from embedding.",
    ]),
    el("div", { class: "notice warn" }, [
      "This tool intentionally doesn't download or convert YouTube videos. Ripping video from YouTube breaks its Terms of Service and can be copyright infringement — exactly the kind of thing worth avoiding on a school network. If you already have a video file (a lecture recording, something you filmed, a Creative-Commons download), use the ",
      el("strong", {}, ["Video Converter"]),
      " or ",
      el("strong", {}, ["Audio Converter"]),
      " in the sidebar instead — those work on any file already on your device.",
    ]),
  );
}
