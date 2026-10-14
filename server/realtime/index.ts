import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { ClientToServerEvents, RoomSnapshot, ServerToClientEvents } from "@shared/realtime";
import { addMessage, addPlaylistMovie, addReaction, controlPlayback, createPoll, getRoomSnapshot, joinRoom, touchParticipant, transferHost, votePoll } from "./store";

type InterServerEvents = Record<string, never>;
type SocketData = { roomCode?: string; participantId?: string };
type RoomSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
const completedActions = new Map<string, { at: number; revision: number }>();
const pendingActions = new Map<string, Promise<void>>();
const reactionActions = new Map<string, { at: number; pending?: Promise<void> }>();

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

function validParticipantToken(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function publicError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  const safePrefixes = ["That room code isn't valid", "Room not found", "Choose a display name", "This participant session is invalid", "This participant session can't be verified", "This room is full", "Only the host", "Only the current host", "That participant has left", "That film isn't in the room catalogue", "Use a YouTube link", "Use a direct HTTPS link", "Write a message", "A poll needs", "That poll is no longer open", "That poll option isn't valid", "Reconnect to this room", "You're no longer in this room", "Choose a reaction"];
  return safePrefixes.some(prefix => message.startsWith(prefix)) ? message : fallback;
}

function emitActionFailure(socket: RoomSocket, actionId: string, error: unknown, fallback: string) {
  const message = publicError(error, fallback);
  socket.emit("room:error", message);
  socket.emit("room:ack", { ok: false, actionId, error: message });
}

function boundToRoom(socket: RoomSocket, code: string, participantId: string) {
  return socket.data.roomCode === code.trim().toUpperCase() && socket.data.participantId === participantId;
}

export function attachRealtime(server: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    pingInterval: 6_000,
    pingTimeout: 12_000,
    connectTimeout: 15_000,
    maxHttpBufferSize: 64 * 1024,
    transports: ["websocket", "polling"],
    allowEIO3: false,
  });

  async function publish(code: string, snapshot: RoomSnapshot, actionId?: string) {
    io.to(code).emit("room:update", { snapshot, actionId, acceptedAt: Date.now() });
  }

  async function runAction(socket: RoomSocket, code: string, participantId: string, actionId: string | undefined, task: () => Promise<RoomSnapshot | null>) {
    if (!boundToRoom(socket, code, participantId)) throw new Error("Reconnect to this room before sending an action.");
    const key = actionId && /^[0-9a-f-]{36}$/i.test(actionId) ? `${code}:${participantId}:${actionId}` : null;
    const ack = (revision: number) => {
      if (actionId) socket.emit("room:ack", { ok: true, actionId, revision, acceptedAt: Date.now() });
    };
    if (key) {
      const completed = completedActions.get(key);
      if (completed && Date.now() - completed.at < 300_000) { ack(completed.revision); return; }
      if (completed) completedActions.delete(key);
      const pending = pendingActions.get(key);
      if (pending) {
        await pending;
        const repeated = completedActions.get(key);
        if (repeated) ack(repeated.revision);
        return;
      }
      const taskPromise = (async () => {
        const snapshot = await task();
        if (!snapshot) throw new Error("The room changed before this action completed.");
        await publish(snapshot.code, snapshot, actionId);
        completedActions.set(key, { at: Date.now(), revision: snapshot.playback.revision });
        ack(snapshot.playback.revision);
      })();
      pendingActions.set(key, taskPromise);
      try { await taskPromise; }
      finally { if (pendingActions.get(key) === taskPromise) pendingActions.delete(key); }
      if (completedActions.size > 10_000) {
        const cutoff = Date.now() - 300_000;
        for (const [id, record] of completedActions) if (record.at < cutoff) completedActions.delete(id);
        if (completedActions.size > 10_000) completedActions.delete(completedActions.keys().next().value!);
      }
      return;
    }
    const snapshot = await task();
    if (!snapshot) throw new Error("The room changed before this action completed.");
    await publish(snapshot.code, snapshot, actionId);
    ack(snapshot.playback.revision);
  }

  io.on("connection", (socket: RoomSocket) => {
    socket.on("room:join", async payload => {
      try {
        if (!validId(payload.participantId) || !validParticipantToken(payload.participantToken)) throw new Error("This participant session is invalid.");
        const code = payload.code.trim().toUpperCase();
        const snapshot = await joinRoom(code, payload.participantId, payload.displayName, payload.participantToken);
        const previous = socket.data.roomCode;
        if (previous && previous !== code) await socket.leave(previous);
        socket.data.roomCode = code;
        socket.data.participantId = payload.participantId;
        await socket.join(code);
        socket.emit("room:snapshot", snapshot);
        socket.emit("room:clock", { serverTime: Date.now(), clientSentAt: payload.clientSentAt, clientEpoch: payload.clientEpoch });
        await publish(code, snapshot);
      } catch (error) {
        socket.emit("room:error", publicError(error, "The room service is unavailable. Reconnect and try again."));
      }
    });

    socket.on("room:heartbeat", async payload => {
      try {
        if (!boundToRoom(socket, payload.code, payload.participantId)) return;
        await touchParticipant(payload.code, payload.participantId);
        socket.emit("room:clock", { serverTime: Date.now(), clientSentAt: payload.clientSentAt, clientEpoch: payload.clientEpoch });
      } catch { /* a later reconnect will receive the authoritative error/snapshot */ }
    });

    socket.on("playback:control", async payload => {
      try {
        await runAction(socket, payload.code, payload.participantId, payload.actionId, async () => {
          const result = await controlPlayback(payload);
          return result.snapshot;
        });
      } catch (error) {
        emitActionFailure(socket, payload.actionId, error, "Playback couldn't be updated. The room service may be unavailable; reconnect and try again.");
      }
    });

    socket.on("chat:send", async payload => {
      try {
        await runAction(socket, payload.code, payload.participantId, payload.actionId, () => addMessage(payload.code, payload.participantId, payload.body));
      } catch (error) { emitActionFailure(socket, payload.actionId, error, "Message couldn't be sent. Reconnect and try again."); }
    });

    socket.on("reaction:send", async payload => {
      try {
        if (!boundToRoom(socket, payload.code, payload.participantId)) throw new Error("Reconnect to this room before reacting.");
        if (!validId(payload.actionId)) throw new Error("This action couldn't be verified.");
        const key = `${payload.code}:${payload.participantId}:${payload.actionId}`;
        const prior = reactionActions.get(key);
        if (prior?.pending) {
          await prior.pending;
          socket.emit("room:ack", { ok: true, actionId: payload.actionId, acceptedAt: Date.now() });
          return;
        }
        if (prior && Date.now() - prior.at < 60_000) {
          socket.emit("room:ack", { ok: true, actionId: payload.actionId, acceptedAt: Date.now() });
          return;
        }
        const pending = (async () => {
          const reaction = await addReaction(payload.code, payload.participantId, payload.emoji);
          io.to(socket.data.roomCode!).emit("room:reaction", reaction);
        })();
        reactionActions.set(key, { at: Date.now(), pending });
        try {
          await pending;
          reactionActions.set(key, { at: Date.now() });
          socket.emit("room:ack", { ok: true, actionId: payload.actionId, acceptedAt: Date.now() });
          if (reactionActions.size > 5_000) {
            const cutoff = Date.now() - 60_000;
            for (const [id, entry] of reactionActions) if (!entry.pending && entry.at < cutoff) reactionActions.delete(id);
            if (reactionActions.size > 5_000) reactionActions.delete(reactionActions.keys().next().value!);
          }
        } catch (error) {
          reactionActions.delete(key);
          throw error;
        }
      } catch (error) { emitActionFailure(socket, payload.actionId, error, "Reaction couldn't be sent. Reconnect and try again."); }
    });

    socket.on("playlist:add", async payload => {
      try {
        await runAction(socket, payload.code, payload.participantId, payload.actionId, () => addPlaylistMovie(payload.code, payload.participantId, payload.movieId));
      } catch (error) { emitActionFailure(socket, payload.actionId, error, "Film couldn't be added. Reconnect and try again."); }
    });

    socket.on("poll:create", async payload => {
      try {
        await runAction(socket, payload.code, payload.participantId, payload.actionId, () => createPoll(payload.code, payload.participantId, payload.question, payload.options));
      } catch (error) { emitActionFailure(socket, payload.actionId, error, "Poll couldn't be created. Reconnect and try again."); }
    });

    socket.on("poll:vote", async payload => {
      try {
        await runAction(socket, payload.code, payload.participantId, payload.actionId, () => votePoll(payload.code, payload.participantId, payload.pollId, payload.optionIndex));
      } catch (error) { emitActionFailure(socket, payload.actionId, error, "Vote couldn't be recorded. Reconnect and try again."); }
    });

    socket.on("host:transfer", async payload => {
      try {
        await runAction(socket, payload.code, payload.participantId, payload.actionId, () => transferHost(payload.code, payload.participantId, payload.targetParticipantId));
      } catch (error) { emitActionFailure(socket, payload.actionId, error, "Host transfer failed. Reconnect and try again."); }
    });
  });

  return io;
}
