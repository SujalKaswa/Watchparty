export type SeekRangeInput = {
  durationMs: number;
  videoDurationSeconds: number;
  currentTimeSeconds: number;
  estimatedPositionMs: number;
  draftSeconds: number | null;
};

export type SeekRange = { max: number; value: number; canSeek: boolean };

function finitePositive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function getSeekRange(input: SeekRangeInput): SeekRange {
  const mediaDurationSeconds = finitePositive(input.durationMs)
    ? input.durationMs / 1_000
    : finitePositive(input.videoDurationSeconds);
  const max = Math.max(1, Math.floor(mediaDurationSeconds ?? 1));
  const draft = input.draftSeconds !== null && Number.isFinite(input.draftSeconds) ? input.draftSeconds : null;
  const current = Number.isFinite(input.currentTimeSeconds) ? input.currentTimeSeconds : null;
  const estimated = Number.isFinite(input.estimatedPositionMs) ? input.estimatedPositionMs / 1_000 : 0;
  const candidate = draft ?? current ?? estimated;
  const value = Math.min(max, Math.max(0, Math.floor(Number.isFinite(candidate) ? candidate : 0)));
  return { max, value, canSeek: mediaDurationSeconds !== null };
}
