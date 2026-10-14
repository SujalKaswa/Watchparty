import type { PlaybackState } from "./realtime";

export function estimatePositionMs(playback: PlaybackState, now = Date.now()) {
  if (!playback.playing) return playback.positionMs;
  const elapsed = Math.max(0, now - playback.serverTimestamp);
  return playback.durationMs > 0
    ? Math.min(playback.durationMs, playback.positionMs + elapsed)
    : playback.positionMs + elapsed;
}

export type DriftCorrection =
  | { type: "none"; driftMs: number; playbackRate: 1 }
  | { type: "rate"; driftMs: number; playbackRate: number }
  | { type: "seek"; driftMs: number; positionMs: number; playbackRate: 1 };

export function planDriftCorrection(playback: PlaybackState, actualPositionMs: number, now = Date.now()): DriftCorrection {
  const expected = estimatePositionMs(playback, now);
  const driftMs = expected - actualPositionMs;
  const magnitude = Math.abs(driftMs);
  if (magnitude <= 120) return { type: "none", driftMs, playbackRate: 1 };
  if (magnitude > 500) return { type: "seek", driftMs, positionMs: expected, playbackRate: 1 };
  const adjustment = Math.max(-0.04, Math.min(0.04, driftMs / 8_000));
  return { type: "rate", driftMs, playbackRate: 1 + adjustment };
}
