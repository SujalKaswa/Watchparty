import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ActionAck, ClientToServerEvents, RoomSnapshot, ServerToClientEvents } from "@shared/realtime";
import { getDisplayName, getParticipantId, getParticipantToken } from "./identity";
import { emitSocketEvent } from "./socket-event";

export const EMOJI_REACTIONS = ["❤️", "😂", "👏", "🔥", "😮", "😭", "🍿", "✨"];

type RoomSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type Reaction = { participantId: string; name: string; emoji: string; createdAt: number };
type QueuedAction = { id: string; event: string; payload: Record<string, unknown>; createdAt: number };

const MAX_PENDING_ACTIONS = 100;
const PENDING_ACTION_TTL_MS = 4 * 60_000;

function actionId() { return crypto.randomUUID(); }

export function useWatchRoom(code: string) {
  const participantId = getParticipantId();
  const participantToken = getParticipantToken();
  const [displayName, setDisplayName] = useState(getDisplayName());
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const socketRef = useRef<RoomSocket | null>(null);
  const joinedRef = useRef(false);
  const pendingActions = useRef(new Map<string, QueuedAction>());
  const sentAt = useRef(new Map<string, number>());
  const flushPendingRef = useRef<() => void>(() => {});
  const hasOfflineQueue = useRef(false);

  useEffect(() => {
    let active = true;
    const socket = io({
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 400,
      reconnectionDelayMax: 5_000,
      timeout: 12_000,
    });
    const typedSocket = socket as unknown as RoomSocket;
    socketRef.current = typedSocket;

    const acceptSnapshot = (next: RoomSnapshot) => {
      if (!active) return;
      setSnapshot(current => {
        if (current && current.code === next.code && current.playback.revision > next.playback.revision) return current;
        return next;
      });
    };

    flushPendingRef.current = () => {
      const currentSocket = socketRef.current;
      if (!currentSocket?.connected || !joinedRef.current) return;
      const now = Date.now();
      let expired = false;
      for (const [id, action] of pendingActions.current) {
        if (now - action.createdAt > PENDING_ACTION_TTL_MS) {
          pendingActions.current.delete(id);
          sentAt.current.delete(id);
          expired = true;
          continue;
        }
        if (sentAt.current.has(id)) continue;
        sentAt.current.set(id, performance.now());
        emitSocketEvent(currentSocket, action.event, { code: code.toUpperCase(), participantId, actionId: id, ...action.payload });
      }
      if (expired) {
        hasOfflineQueue.current = false;
        setError("An action could not be confirmed before reconnecting took too long. Check the room state before retrying.");
      }
    };

    const join = () => {
      joinedRef.current = false;
      sentAt.current.clear();
      setConnected(true);
      setError("");
      typedSocket.emit("room:join", { code: code.toUpperCase(), participantId, participantToken, displayName, clientSentAt: performance.now(), clientEpoch: Date.now() });
    };
    typedSocket.on("connect", join);
    typedSocket.on("disconnect", () => {
      joinedRef.current = false;
      sentAt.current.clear();
      if (active) setConnected(false);
    });
    typedSocket.on("connect_error", () => {
      joinedRef.current = false;
      if (active) { setConnected(false); setError("Connection interrupted. Reconnecting…"); }
    });
    socket.io.on("reconnect_attempt", () => { if (active) setConnected(false); });
    typedSocket.on("room:snapshot", next => {
      acceptSnapshot(next);
      joinedRef.current = true;
      flushPendingRef.current();
    });
    typedSocket.on("room:update", message => acceptSnapshot(message.snapshot));
    typedSocket.on("room:clock", message => {
      if (message.clientSentAt === undefined || message.clientEpoch === undefined) return;
      const roundTrip = Math.max(0, performance.now() - message.clientSentAt);
      const offset = message.serverTime - (message.clientEpoch + roundTrip / 2);
      setClockOffsetMs(current => current * 0.65 + offset * 0.35);
    });
    typedSocket.on("room:error", message => { if (active) setError(message); });
    typedSocket.on("room:reaction", reaction => {
      if (!active) return;
      setReactions(current => [...current.slice(-12), reaction]);
      window.setTimeout(() => setReactions(current => current.filter(item => item !== reaction)), 3_800);
    });
    typedSocket.on("room:ack", (ack: ActionAck & { actionId: string }) => {
      const started = sentAt.current.get(ack.actionId);
      if (started !== undefined) {
        setLastLatencyMs(Math.max(0, Math.round(performance.now() - started)));
        sentAt.current.delete(ack.actionId);
      }
      pendingActions.current.delete(ack.actionId);
      if (!ack.ok && active) setError(ack.error);
      if (ack.ok && hasOfflineQueue.current && pendingActions.current.size === 0) {
        hasOfflineQueue.current = false;
        if (active) setError("");
      }
    });
    socket.connect();
    const heartbeat = window.setInterval(() => {
      if (typedSocket.connected) typedSocket.emit("room:heartbeat", { code: code.toUpperCase(), participantId, clientSentAt: performance.now(), clientEpoch: Date.now() });
    }, 8_000);

    return () => {
      active = false;
      joinedRef.current = false;
      sentAt.current.clear();
      flushPendingRef.current = () => {};
      window.clearInterval(heartbeat);
      socket.disconnect();
      socket.removeAllListeners();
      socketRef.current = null;
    };
  }, [code, participantId, participantToken, displayName]);

  const emit = (event: string, payload: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (pendingActions.current.size >= MAX_PENDING_ACTIONS) {
      setError("The offline action queue is full. Review the room state before trying again.");
      return;
    }
    const id = actionId();
    pendingActions.current.set(id, { id, event, payload, createdAt: Date.now() });
    if (!socket?.connected || !joinedRef.current) {
      hasOfflineQueue.current = true;
      setError("Connection interrupted. This action is queued and will send after the room rejoins.");
      return;
    }
    flushPendingRef.current();
  };

  return {
    participantId,
    displayName,
    setDisplayName,
    snapshot,
    connected,
    error,
    setError,
    reactions,
    lastLatencyMs,
    clockOffsetMs,
    control: (action: "play" | "pause" | "seek" | "select" | "source", options: Record<string, unknown> = {}) => emit("playback:control", { action, ...options }),
    sendChat: (body: string) => emit("chat:send", { body }),
    react: (emoji: string) => emit("reaction:send", { emoji }),
    addMovie: (movieId: string) => emit("playlist:add", { movieId }),
    createPoll: (question: string, options: string[]) => emit("poll:create", { question, options }),
    vote: (pollId: string, optionIndex: number) => emit("poll:vote", { pollId, optionIndex }),
    transferHost: (targetParticipantId: string) => emit("host:transfer", { targetParticipantId }),
  };
}
