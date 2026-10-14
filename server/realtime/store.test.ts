import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoom, controlPlayback, getRoomSnapshot, joinRoom, transferHost } from "./store";
import { planDriftCorrection, estimatePositionMs } from "../../shared/sync";
import { YOUTUBE_SAMPLE_URL } from "../../shared/video";
import type { PlaybackState } from "../../shared/realtime";

beforeEach(() => vi.stubEnv("REELROOM_EPHEMERAL", "1"));
afterAll(() => vi.unstubAllEnvs());

function person() { return { participantId: randomUUID(), participantToken: randomBytes(32).toString("hex"), displayName: `Guest ${Math.floor(Math.random() * 1_000_000)}` }; }

describe("room authority and playback sync", () => {
  it("accepts the supplied YouTube URL as a shared playback source and canonicalizes it", async () => {
    const host = person();
    const { code } = await createRoom(host);
    const accepted = await controlPlayback({ code, participantId: host.participantId, actionId: randomUUID(), action: "source", videoUrl: YOUTUBE_SAMPLE_URL, movieTitle: "Shared movie" });
    expect(accepted.snapshot?.playback.videoUrl).toBe("https://www.youtube.com/watch?v=lo4bA4p3MBQ");
    expect(accepted.snapshot?.playback.movieTitle).toBe("Shared movie");
    await expect(controlPlayback({ code, participantId: host.participantId, actionId: randomUUID(), action: "source", videoUrl: "https://example.com/watch?id=movie" }))
      .rejects.toThrow("Use a YouTube link");
  });

  it("creates a room, admits 10 attendees, and gives late joins the current snapshot", async () => {
    const host = person();
    const created = await createRoom(host);
    const selected = await controlPlayback({ code: created.code, participantId: host.participantId, actionId: randomUUID(), action: "select", movieId: "the-godfather" });
    const playing = await controlPlayback({ code: created.code, participantId: host.participantId, actionId: randomUUID(), action: "play" });
    expect(selected.snapshot?.playback.movieId).toBe("the-godfather");
    expect(playing.snapshot?.playback.playing).toBe(true);

    const attendees = await Promise.all(Array.from({ length: 9 }, async () => {
      const guest = person();
      return joinRoom(created.code, guest.participantId, guest.displayName, guest.participantToken);
    }));
    expect(attendees.at(-1)?.participants).toHaveLength(10);
    const late = person();
    const reconciled = await joinRoom(created.code, late.participantId, late.displayName, late.participantToken);
    expect(reconciled.participants).toHaveLength(11);
    expect(reconciled.playback.revision).toBeGreaterThan(playing.snapshot?.playback.revision ?? 0);
    expect(reconciled.playback.playing).toBe(true);
  });

  it("serializes concurrent host seeks and deduplicates retried action IDs", async () => {
    const host = person();
    const { code } = await createRoom(host);
    const initial = await getRoomSnapshot(code);
    const actions = Array.from({ length: 20 }, (_, index) => ({
      code, participantId: host.participantId, actionId: randomUUID(), action: "seek" as const, positionMs: index * 1_000,
    }));
    const results = await Promise.all(actions.map(action => controlPlayback(action)));
    const state = await getRoomSnapshot(code);
    expect(state?.playback.revision).toBe((initial?.playback.revision ?? 0) + actions.length);
    expect(state?.playback.positionMs).toBeGreaterThanOrEqual(0);
    expect(results.every(result => result.result.ok)).toBe(true);

    const repeated = { code, participantId: host.participantId, actionId: randomUUID(), action: "seek" as const, positionMs: 11_000 };
    const first = await controlPlayback(repeated);
    const again = await controlPlayback(repeated);
    expect(again.result).toEqual(first.result);
    expect((await getRoomSnapshot(code))?.playback.revision).toBe(first.snapshot?.playback.revision);
  });

  it("rejects non-host controls and transfers host to an active attendee", async () => {
    const host = person();
    const guest = person();
    const { code } = await createRoom(host);
    await joinRoom(code, guest.participantId, guest.displayName, guest.participantToken);
    await expect(controlPlayback({ code, participantId: guest.participantId, actionId: randomUUID(), action: "pause" })).rejects.toThrow("Only the host");
    await controlPlayback({ code, participantId: host.participantId, actionId: randomUUID(), action: "play" });
    const beforeTransfer = await getRoomSnapshot(code);
    await new Promise(resolve => setTimeout(resolve, 20));
    const transferred = await transferHost(code, host.participantId, guest.participantId);
    expect(transferred?.hostId).toBe(guest.participantId);
    expect(transferred?.playback.positionMs).toBeGreaterThan(0);
    expect(transferred?.playback.serverTimestamp).toBeGreaterThan(beforeTransfer!.playback.serverTimestamp);
    const accepted = await controlPlayback({ code, participantId: guest.participantId, actionId: randomUUID(), action: "play" });
    expect(accepted.snapshot?.playback.playing).toBe(true);
  });

  it("does not allow a room member to claim the host with only the host's public participant ID", async () => {
    const host = person();
    const guest = person();
    const { code } = await createRoom(host);
    await joinRoom(code, guest.participantId, guest.displayName, guest.participantToken);
    await expect(joinRoom(code, host.participantId, "Impersonator", guest.participantToken)).rejects.toThrow("session can't be verified");
    expect((await getRoomSnapshot(code))?.hostId).toBe(host.participantId);
    const realNow = Date.now();
    vi.setSystemTime(realNow + 91_000);
    try {
      expect((await getRoomSnapshot(code))?.participants).toHaveLength(0);
      await expect(joinRoom(code, host.participantId, "Impersonator", guest.participantToken)).rejects.toThrow("session can't be verified");
      expect((await joinRoom(code, host.participantId, "Host", host.participantToken)).hostId).toBe(host.participantId);
    } finally {
      vi.setSystemTime(realNow);
    }
  });
});

describe("clock estimation and drift correction", () => {
  const state: PlaybackState = { movieId: "x", movieTitle: "Test", videoUrl: null, durationMs: 100_000, positionMs: 10_000, playing: true, serverTimestamp: 1_000, revision: 1 };

  it("estimates the authoritative playhead and seeks when error exceeds 500 ms", () => {
    expect(estimatePositionMs(state, 3_000)).toBe(12_000);
    const plan = planDriftCorrection(state, 11_000, 3_000);
    expect(plan.type).toBe("seek");
    if (plan.type === "seek") expect(plan.positionMs).toBe(12_000);
  });

  it("uses bounded rate correction for moderate drift and leaves small jitter alone", () => {
    const moderate = planDriftCorrection(state, 11_700, 3_000);
    expect(moderate.type).toBe("rate");
    if (moderate.type === "rate") expect(moderate.playbackRate).toBeGreaterThan(1);
    const small = planDriftCorrection(state, 11_940, 3_000);
    expect(small.type).toBe("none");
  });
});
