import { randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { performance } from "node:perf_hooks";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { io, type Socket } from "socket.io-client";
import superjson from "superjson";
import type { AppRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { appRouter } from "../server/routers";
import { attachRealtime } from "../server/realtime";
import { estimatePositionMs, planDriftCorrection } from "../shared/sync";
import type { PlaybackState } from "../shared/realtime";

const PEOPLE = 10;
const ACTIONS = 100;
const createParticipantToken = () => randomBytes(32).toString("hex");
const clients: Socket[] = [];
const received: number[] = [];
const sentAt = new Map<string, number>();
const acknowledgements = new Map<string, boolean>();
const snapshots = new Map<number, number>();
const messageCounts = new Map<number, number>();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(predicate: () => boolean, label: string, timeoutMs = 15_000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (predicate()) return;
    await sleep(20);
  }
  throw new Error(`Timed out while waiting for ${label}.`);
}

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)] ?? 0;
}

function simulateDriftCorrection() {
  const playback: PlaybackState = {
    movieId: "simulation", movieTitle: "Clock model", videoUrl: null,
    durationMs: 0, positionMs: 10_000, playing: true, serverTimestamp: 1_000, revision: 1,
  };
  const absoluteDrifts: number[] = [];
  const finalDrifts: number[] = [];
  for (let initial = -2_000; initial <= 2_000; initial += 25) {
    let drift = initial;
    for (let tick = 0; tick < 12; tick += 1) {
      const now = 1_000 + tick * 1_200;
      const expected = estimatePositionMs(playback, now);
      const correction = planDriftCorrection(playback, expected - drift, now);
      if (correction.type === "seek") drift = 0;
      else if (correction.type === "rate") drift -= (correction.playbackRate - 1) * 1_200;
      absoluteDrifts.push(Math.abs(drift));
    }
    finalDrifts.push(Math.abs(drift));
  }
  const maximum = Math.max(...absoluteDrifts);
  return {
    simulatedInitialOffsets: 161,
    correctionTicksPerOffset: 12,
    observationCount: absoluteDrifts.length,
    maximumAbsoluteDriftMs: Number(maximum.toFixed(2)),
    p95AbsoluteDriftMs: Number(percentile(absoluteDrifts, 0.95).toFixed(2)),
    maximumFinalAbsoluteDriftMs: Number(Math.max(...finalDrifts).toFixed(2)),
    toleranceMs: 500,
    targetMet: maximum <= 500,
    method: "Ideal linear-playback model: apply each returned hard seek or bounded playback-rate correction every 1.2 seconds; no decoder, network jitter, or media buffering is simulated.",
  };
}

async function main() {
  // This isolated process intentionally uses volatile storage so the benchmark never writes test rooms to the shared managed database.
  process.env.REELROOM_EPHEMERAL = "1";
  const app = express();
  const server = createServer(app);
  const ioServer = attachRealtime(server);
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => { server.removeListener("error", reject); resolve(); });
  });
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const trpc = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({ url: `${baseUrl}/api/trpc`, transformer: superjson })] });
  const hostId = randomUUID();
  const hostToken = createParticipantToken();
  let roomCode = "";

  async function connectParticipant(index: number, participantId = randomUUID(), participantToken = createParticipantToken()) {
    const socket = io(baseUrl, { transports: ["websocket", "polling"], reconnection: true, timeout: 12_000 });
    clients.push(socket);
    socket.on("connect", () => socket.emit("room:join", { code: roomCode, participantId, participantToken, displayName: index === 0 ? "Latency host" : `Guest ${index + 1}` }));
    socket.on("room:snapshot", snapshot => {
      snapshots.set(index, snapshot.playback.revision);
      messageCounts.set(index, snapshot.messages.length);
    });
    socket.on("room:update", (event: { snapshot: { playback: { revision: number }; messages: unknown[] }; actionId?: string }) => {
      snapshots.set(index, event.snapshot.playback.revision);
      messageCounts.set(index, event.snapshot.messages.length);
      if (event.actionId) {
        const start = sentAt.get(event.actionId);
        if (start !== undefined) received.push(performance.now() - start);
      }
    });
    socket.on("room:ack", (ack: { actionId: string; ok: boolean }) => acknowledgements.set(ack.actionId, ack.ok));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Client ${index + 1} failed to connect.`)), 15_000);
      socket.once("connect", () => { clearTimeout(timer); resolve(); });
      socket.connect();
    });
    return { socket, participantId };
  }

  try {
    const room = await trpc.room.create.mutate({ participantId: hostId, participantToken: hostToken, displayName: "Latency host" });
    roomCode = room.code;
    const participants = await Promise.all(Array.from({ length: PEOPLE }, (_, index) => index === 0 ? connectParticipant(index, hostId, hostToken) : connectParticipant(index, randomUUID())));
    await waitFor(() => snapshots.size === PEOPLE, "all ten participants to receive the initial room snapshot");
    await sleep(250);
    received.length = 0;
    let lastActionId = "";

    for (let action = 0; action < ACTIONS; action += 1) {
      const actionId = randomUUID();
      lastActionId = actionId;
      sentAt.set(actionId, performance.now());
      const deliveredBefore = received.length;
      participants[0].socket.emit("playback:control", {
        code: room.code,
        participantId: hostId,
        actionId,
        action: "seek",
        positionMs: (action * 137) % 30_000,
      });
      await waitFor(() => received.length >= deliveredBefore + PEOPLE, `control ${action + 1} to reach all participants`, 8_000);
    }

    const stableMeasurements = received.slice(-ACTIONS * PEOPLE);
    const latestRevision = snapshots.get(0) ?? 0;
    participants[8].socket.disconnect();
    await sleep(100);
    participants[8].socket.connect();
    await waitFor(() => snapshots.has(8) && (snapshots.get(8) ?? -1) > latestRevision, "reconnect snapshot reconciliation");
    const reconnectSnapshotRevision = snapshots.get(8);

    const late = await connectParticipant(PEOPLE, randomUUID());
    await waitFor(() => snapshots.has(PEOPLE) && (snapshots.get(PEOPLE) ?? -1) > latestRevision, "late-join snapshot reconciliation");
    const lateJoinSnapshotRevision = snapshots.get(PEOPLE);

    const concurrentIds = Array.from({ length: 12 }, () => randomUUID());
    const expectedAfterConcurrent = (snapshots.get(0) ?? latestRevision) + concurrentIds.length;
    for (const [index, id] of concurrentIds.entries()) {
      sentAt.set(id, performance.now());
      participants[0].socket.emit("playback:control", { code: room.code, participantId: hostId, actionId: id, action: "seek", positionMs: (index + 1) * 1_000 });
    }
    await waitFor(() => (snapshots.get(0) ?? 0) >= expectedAfterConcurrent, "concurrent actions to settle");
    await sleep(100);
    const concurrentActionsFinalRevision = snapshots.get(0);

    const beforeOfflineActionRevision = snapshots.get(0) ?? 0;
    const beforeOfflineActionMessages = messageCounts.get(0) ?? 0;
    participants[0].socket.disconnect();
    await sleep(100);
    participants[0].socket.connect();
    await waitFor(() => (snapshots.get(0) ?? -1) > beforeOfflineActionRevision, "the host to receive a fresh snapshot after reconnect");
    const offlineBufferedActionId = randomUUID();
    participants[0].socket.emit("chat:send", { code: room.code, participantId: hostId, actionId: offlineBufferedActionId, body: "Queued while offline, sent after room reconciliation." });
    await waitFor(() => acknowledgements.get(offlineBufferedActionId) === true, "the buffered action to receive an accepted acknowledgement");
    await waitFor(() => messageCounts.get(0) === beforeOfflineActionMessages + 1, "the buffered message to appear once");
    const bufferedActionDeliveredAfterReconnect = true;

    const messagesBeforeRetry = messageCounts.get(0) ?? 0;
    const duplicateChatId = randomUUID();
    const chatPayload = { code: room.code, participantId: hostId, actionId: duplicateChatId, body: "One shared message, even after a retry." };
    participants[0].socket.emit("chat:send", chatPayload);
    participants[0].socket.emit("chat:send", chatPayload);
    await waitFor(() => messageCounts.get(0) === messagesBeforeRetry + 1, "the single accepted duplicate-chat action");
    await sleep(100);
    const duplicateChatMessageCount = messageCounts.get(0);
    const allParticipantsSawSingleMessage = Array.from({ length: PEOPLE + 1 }, (_, index) => messageCounts.get(index) === messagesBeforeRetry + 1).every(Boolean);

    const driftCorrection = simulateDriftCorrection();
    const report = {
      test: "Socket.IO room fan-out over isolated local loopback",
      testConditions: "Sandbox Ubuntu process, Node runtime, one isolated HTTP/Socket.IO listener on 127.0.0.1, 10 concurrent clients during 100 sequential control actions, 100 recipient deliveries per action, volatile in-memory room store, 250 ms warm-up.",
      runtime: `${process.platform}/${process.arch}, Node ${process.version}`,
      endpoint: baseUrl,
      concurrentParticipantsDuringMainRun: PEOPLE,
      controlActions: ACTIONS,
      deliverySamples: stableMeasurements.length,
      propagationMs: {
        p50: Number(percentile(stableMeasurements, 0.50).toFixed(2)),
        p95: Number(percentile(stableMeasurements, 0.95).toFixed(2)),
        max: Number(Math.max(...stableMeasurements).toFixed(2)),
      },
      p95TargetMs: 250,
      loopbackTargetMet: percentile(stableMeasurements, 0.95) <= 250,
      lateJoinSnapshotRevision,
      reconnectSnapshotRevision,
      concurrentActionsFinalRevision,
      expectedConcurrentRevision: expectedAfterConcurrent,
      bufferedActionDeliveredAfterReconnect,
      duplicateChatRetryProducedOneMessage: duplicateChatMessageCount === messagesBeforeRetry + 1 && allParticipantsSawSingleMessage,
      driftCorrection,
      caveat: "Loopback evidence is not a separate-device Wi-Fi LAN, Internet, real-media decoder/buffering, or multi-instance production benchmark. The drift result is a deterministic ideal-clock simulation, not physical playback measurements.",
      lastMeasuredAction: lastActionId,
    };
    console.log(JSON.stringify(report, null, 2));
    if (stableMeasurements.length < ACTIONS * PEOPLE || !report.loopbackTargetMet || !report.bufferedActionDeliveredAfterReconnect || !report.duplicateChatRetryProducedOneMessage || concurrentActionsFinalRevision !== expectedAfterConcurrent || !driftCorrection.targetMet) process.exitCode = 1;
    late.socket.disconnect();
  } finally {
    clients.forEach(socket => socket.disconnect());
    await new Promise<void>(resolve => ioServer.close(() => resolve()));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
