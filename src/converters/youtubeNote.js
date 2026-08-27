import { el, card } from "../helpers.js";

export function render(container) {
  container.append(
    el("div", { class: "notice warn" }, [
      "This tool intentionally doesn't download or convert YouTube videos. Ripping video from YouTube breaks YouTube's Terms of Service and can be copyright infringement depending on the content — exactly the kind of thing you said you wanted to avoid getting flagged for on a school network. Skipping it is the safe call, not a missing feature.",
    ]),
    card("What to use instead", [
      el("ul", {}, [
        el("li", {}, ["Already have a video file (a lecture recording, a clip you filmed, a Creative-Commons download)? Use the ", el("strong", {}, ["Video Converter"]), " or ", el("strong", {}, ["Audio Converter"]), " in the sidebar — those work on any file already on your device."]),
        el("li", {}, ["Need an official copy of a YouTube video for offline schoolwork? YouTube's own app supports offline saving for Premium users, and many teachers can share the original file or a Creative Commons / public-domain source directly."]),
        el("li", {}, ["Need just the audio of something you're allowed to keep? Screen-record or use your OS's built-in audio capture, then convert that file here."]),
      ]),
    ]),
  );
}
