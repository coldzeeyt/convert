import { renderMediaConverter } from "./mediaConverterUI.js";

const targets = [
  { ext: "mp4", label: "MP4 (H.264)", args: (i, o) => ["-i", i, "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-c:a", "aac", "-b:a", "160k", o] },
  { ext: "webm", label: "WebM (VP8)", args: (i, o) => ["-i", i, "-c:v", "libvpx", "-b:v", "1M", "-c:a", "libvorbis", o] },
  { ext: "mov", label: "MOV", args: (i, o) => ["-i", i, "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-c:a", "aac", o] },
  { ext: "avi", label: "AVI", args: (i, o) => ["-i", i, "-c:v", "mpeg4", "-q:v", "5", "-c:a", "libmp3lame", o] },
  { ext: "gif", label: "Animated GIF", args: (i, o) => ["-i", i, "-vf", "fps=10,scale=480:-1:flags=lanczos", o] },
  { ext: "mp3", label: "MP3 (extract audio only)", args: (i, o) => ["-i", i, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", o] },
  { ext: "wav", label: "WAV (extract audio only)", args: (i, o) => ["-i", i, "-vn", o] },
];

export function render(container) {
  renderMediaConverter(container, {
    accept: "video/*",
    targets,
    hint: "MP4, WebM, MOV, AVI, animated GIF, or pull just the audio track out",
    extraNotice: "Everything runs locally in your browser tab (via ffmpeg.wasm) — your file is never uploaded anywhere. Video encoding can take a while on a school laptop; keep this tab open while it works.",
  });
}
