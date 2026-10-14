import { describe, expect, it } from "vitest";
import { getSeekRange } from "./seek-range";

describe("getSeekRange", () => {
  it("returns safe disabled attributes when media timing is NaN", () => {
    expect(getSeekRange({
      durationMs: Number.NaN,
      videoDurationSeconds: Number.NaN,
      currentTimeSeconds: Number.NaN,
      estimatedPositionMs: Number.NaN,
      draftSeconds: Number.NaN,
    })).toEqual({ max: 1, value: 0, canSeek: false });
  });

  it("uses a finite video duration and falls back from invalid playhead values", () => {
    expect(getSeekRange({
      durationMs: Number.NaN,
      videoDurationSeconds: 80.8,
      currentTimeSeconds: Number.NaN,
      estimatedPositionMs: 25_000,
      draftSeconds: Number.NaN,
    })).toEqual({ max: 80, value: 25, canSeek: true });
  });

  it("clamps a finite seek draft to the media range", () => {
    expect(getSeekRange({
      durationMs: 120_000,
      videoDurationSeconds: Number.POSITIVE_INFINITY,
      currentTimeSeconds: 20,
      estimatedPositionMs: 30_000,
      draftSeconds: 200,
    })).toEqual({ max: 120, value: 120, canSeek: true });
  });
});
