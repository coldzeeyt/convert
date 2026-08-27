import { renderMediaConverter } from "./mediaConverterUI.js";

const targets = [
  { ext: "mp3", label: "MP3", args: (i, o) => ["-i", i, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", o] },
  { ext: "wav", label: "WAV", args: (i, o) => ["-i", i, "-vn", o] },
  { ext: "ogg", label: "OGG (Vorbis)", args: (i, o) => ["-i", i, "-vn", "-c:a", "libvorbis", "-q:a", "5", o] },
  { ext: "flac", label: "FLAC (lossless)", args: (i, o) => ["-i", i, "-vn", "-c:a", "flac", o] },
  { ext: "m4a", label: "M4A / AAC", args: (i, o) => ["-i", i, "-vn", "-c:a", "aac", "-b:a", "192k", o] },
  { ext: "opus", label: "Opus", args: (i, o) => ["-i", i, "-vn", "-c:a", "libopus", o] },
];

export function render(container) {
  renderMediaConverter(container, {
    accept: "audio/*,video/*",
    targets,
    hint: "MP3, WAV, OGG, FLAC, M4A, Opus, or an audio track pulled from a video file",
    extraNotice: "Everything runs locally in your browser tab (via ffmpeg.wasm) — your file is never uploaded anywhere.",
  });
}
