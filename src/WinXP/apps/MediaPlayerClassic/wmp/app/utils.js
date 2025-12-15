export function formatTime(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const minutes = Math.floor(value / 60);
  const remainingSeconds = Math.floor(value % 60);
  return `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

export function mediaTypeFromPath(path) {
  if (!path || typeof path !== "string") return "unknown";
  const ext = path.split(".").pop()?.toLowerCase() || "";
  const video = ["mp4", "webm", "ogv", "mov", "mkv", "avi", "wmv"];
  const audio = ["mp3", "ogg", "opus", "oga", "aac", "wav", "flac", "m4a", "wma", "mid"];
  if (video.includes(ext)) return "video";
  if (audio.includes(ext)) return "audio";
  return "unknown";
}
