import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MOVIE_SEEDS } from "./catalog-seed";
import { MAX_CATALOG_MOVIES } from "../shared/catalog";
import { normalizePlayableUrl, YOUTUBE_SAMPLE_URL } from "../shared/video";

describe("curated movie catalog seed", () => {
  it("contains exactly 30 unique, balanced Bollywood and Hollywood records", () => {
    expect(MOVIE_SEEDS).toHaveLength(MAX_CATALOG_MOVIES);
    expect(new Set(MOVIE_SEEDS.map(movie => movie.id)).size).toBe(MAX_CATALOG_MOVIES);
    expect(MOVIE_SEEDS.filter(movie => movie.industry === "Bollywood")).toHaveLength(15);
    expect(MOVIE_SEEDS.filter(movie => movie.industry === "Hollywood")).toHaveLength(15);
    expect(MOVIE_SEEDS.every(movie => movie.featured)).toBe(true);
  });

  it("has a local poster asset and at least one genre for every title", () => {
    for (const movie of MOVIE_SEEDS) {
      const relativePath = movie.posterUrl.replace(/^\/+/, "");
      expect(relativePath).not.toContain("..");
      expect(existsSync(resolve(process.cwd(), "client/public", relativePath))).toBe(true);
      expect(movie.genres.length).toBeGreaterThan(0);
      expect(movie.genres).toContain(movie.genre);
      expect(movie.posterSourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("only attaches supported, evidence-backed playable sources", () => {
    const withSource = MOVIE_SEEDS.filter(movie => movie.videoUrl);
    expect(withSource).toHaveLength(15);
    for (const movie of withSource) {
      expect(normalizePlayableUrl(movie.videoUrl!)).not.toBeNull();
      expect(movie.playbackSourceType).toMatch(/^(official|public-domain)$/);
      expect(movie.playbackSourceUrl).toMatch(/^https:\/\//);
      expect(movie.playbackRightsNote?.trim()).toBeTruthy();
      expect(movie.playbackRightsNote!.length).toBeLessThanOrEqual(512);
    }
    for (const movie of MOVIE_SEEDS.filter(item => !item.videoUrl)) {
      expect(movie.playbackSourceType).toBeFalsy();
      expect(movie.playbackSourceUrl).toBeFalsy();
      expect(movie.playbackRightsNote).toBeFalsy();
    }
  });

  it("still accepts the supplied YouTube short link for host-provided videos", () => {
    expect(normalizePlayableUrl(YOUTUBE_SAMPLE_URL)).toBe("https://www.youtube.com/watch?v=lo4bA4p3MBQ");
  });
});
