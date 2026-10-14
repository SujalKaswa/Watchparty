const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtu.be",
  "www.youtu.be",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const DIRECT_MEDIA_PATH = /\.(mp4|webm|ogg)$/i;

export const YOUTUBE_SAMPLE_URL = "https://youtu.be/lo4bA4p3MBQ?si=kIuKwVv10g5ma5xR";

export function getYouTubeVideoId(rawUrl: string): string | null {
  let url: URL;
  try { url = new URL(rawUrl.trim()); }
  catch { return null; }

  if (url.protocol !== "https:" || url.username || url.password || url.port || !YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  if (url.hostname.toLowerCase().endsWith("youtu.be")) id = parts[0] ?? null;
  else if (url.pathname === "/watch") id = url.searchParams.get("v");
  else if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) id = parts[1] ?? null;

  return id && YOUTUBE_VIDEO_ID.test(id) ? id : null;
}

export function normalizePlayableUrl(rawUrl: string): string | null {
  if (!rawUrl.trim() || rawUrl.length > 500) return null;
  let url: URL;
  try { url = new URL(rawUrl.trim()); }
  catch { return null; }

  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  const youtubeId = getYouTubeVideoId(url.href);
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  if (DIRECT_MEDIA_PATH.test(url.pathname)) return url.href.length <= 500 ? url.href : null;
  return null;
}
