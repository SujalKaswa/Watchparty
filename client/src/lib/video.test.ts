import { describe, expect, it } from "vitest";
import { getYouTubeVideoId, normalizePlayableUrl, YOUTUBE_SAMPLE_URL } from "../../../shared/video";

describe("supported playback URLs", () => {
  it("accepts the supplied short YouTube link and removes its tracking parameters", () => {
    expect(getYouTubeVideoId(YOUTUBE_SAMPLE_URL)).toBe("lo4bA4p3MBQ");
    expect(normalizePlayableUrl(YOUTUBE_SAMPLE_URL)).toBe("https://www.youtube.com/watch?v=lo4bA4p3MBQ");
  });

  it("accepts YouTube watch, embed, Shorts, and live URLs", () => {
    const videoId = "lo4bA4p3MBQ";
    for (const url of [
      `https://www.youtube.com/watch?v=${videoId}&list=PL123`,
      `https://youtube.com/embed/${videoId}`,
      `https://m.youtube.com/shorts/${videoId}`,
      `https://youtube-nocookie.com/embed/${videoId}`,
      `https://www.youtube.com/live/${videoId}`,
    ]) expect(getYouTubeVideoId(url)).toBe(videoId);
  });

  it("accepts direct HTTPS media files with query strings", () => {
    expect(normalizePlayableUrl("https://media.example.com/film.webm?token=abc"))
      .toBe("https://media.example.com/film.webm?token=abc");
    expect(normalizePlayableUrl("https://media.example.com/trailer.MP4")).toBe("https://media.example.com/trailer.MP4");
  });

  it("rejects lookalike hosts, insecure URLs, credentials, invalid IDs, and non-video pages", () => {
    expect(getYouTubeVideoId("https://youtube.com.evil.example/watch?v=lo4bA4p3MBQ")).toBeNull();
    expect(getYouTubeVideoId("http://youtu.be/lo4bA4p3MBQ")).toBeNull();
    expect(getYouTubeVideoId("https://youtu.be/short-id")).toBeNull();
    expect(normalizePlayableUrl("http://media.example.com/video.mp4")).toBeNull();
    expect(normalizePlayableUrl("https://user:pass@media.example.com/video.mp4")).toBeNull();
    expect(normalizePlayableUrl("https://youtube.com/channel/UCabc123")).toBeNull();
    expect(normalizePlayableUrl("https://media.example.com/watch")).toBeNull();
  });
});
