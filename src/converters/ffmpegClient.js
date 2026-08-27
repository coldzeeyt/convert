import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

let ffmpegPromise = null;

// Loaded from /ffmpeg/ which is served from this same origin (no CDN, works
// even on networks that block third-party sites) — see public/ffmpeg.
export function getFFmpeg(onLog) {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      if (onLog) ffmpeg.on("log", ({ message }) => onLog(message));
      const base = `${location.origin}/ffmpeg`;
      const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript");
      const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm");
      await ffmpeg.load({ coreURL, wasmURL });
      return ffmpeg;
    })();
  }
  return ffmpegPromise;
}

const MIME_BY_EXT = {
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac",
  aac: "audio/aac", m4a: "audio/mp4", opus: "audio/opus",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", avi: "video/x-msvideo",
  mkv: "video/x-matroska", gif: "image/gif",
};

export function mimeFor(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// buildArgs(inName, outName) => array of ffmpeg CLI args (without leading "ffmpeg")
export async function convertWithFFmpeg(file, outName, buildArgs, { onProgress, onLog } = {}) {
  const ffmpeg = await getFFmpeg(onLog);
  const inName = safeName(file.name);
  const out = safeName(outName);

  const progressHandler = ({ progress }) => onProgress?.(Math.round(progress * 100));
  if (onProgress) ffmpeg.on("progress", progressHandler);

  try {
    await ffmpeg.writeFile(inName, await fetchFile(file));
    await ffmpeg.exec(buildArgs(inName, out));
    const data = await ffmpeg.readFile(out);
    return new Blob([data.buffer], { type: mimeFor(out) });
  } finally {
    if (onProgress) ffmpeg.off("progress", progressHandler);
    for (const name of [inName, out]) {
      try { await ffmpeg.deleteFile(name); } catch { /* ignore */ }
    }
  }
}
