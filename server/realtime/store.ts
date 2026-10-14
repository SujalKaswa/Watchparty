import { and, desc, eq, sql } from "drizzle-orm";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { ActionAck, ChatMessage, Participant, PlaybackState, PlaylistItem, RoomPoll, RoomSnapshot } from "@shared/realtime";
import { normalizePlayableUrl } from "@shared/video";
import { getDb } from "../db";
import { getCatalogMovie } from "../catalog-data";
import { chatMessages, playlistEntries, pollVotes, polls, roomParticipants, rooms } from "../../drizzle/schema";

const ACTIVE_MS = 90_000;
const ROOM_CAPACITY = 50;
const locks = new Map<string, Promise<void>>();
const actionResults = new Map<string, { at: number; result: ActionAck }>();

type MemoryRoom = RoomSnapshot;
const memoryRooms = new Map<string, MemoryRoom>();
const memoryTokenHashes = new Map<string, string>();

async function getRoomDb() {
  const db = await getDb();
  if (!db && process.env.REELROOM_EPHEMERAL !== "1") {
    throw new Error("Room storage is unavailable. Reconnect after the database service recovers.");
  }
  return db;
}

function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

function cleanName(name: string) {
  const result = name.trim().replace(/[<>\u0000-\u001f]/g, "").slice(0, 32);
  if (!result) throw new Error("Choose a display name before joining.");
  return result;
}

function hashParticipantToken(token: string) {
  if (!/^[0-9a-f]{64}$/i.test(token)) throw new Error("This participant session is invalid.");
  return createHash("sha256").update(token.toLowerCase()).digest("hex");
}

function sameTokenHash(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

async function withRoomLock<T>(code: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(code) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const tail = previous.then(() => gate);
  locks.set(code, tail);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (locks.get(code) === tail) locks.delete(code);
  }
}

function assertCode(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(normalized)) throw new Error("That room code isn't valid.");
  return normalized;
}

function activeParticipants(participants: Participant[]) {
  const cutoff = Date.now() - ACTIVE_MS;
  return participants.filter(person => person.lastSeenAt >= cutoff);
}

function playbackPosition(playback: PlaybackState, now = Date.now()) {
  return playback.playing
    ? Math.min(playback.positionMs + Math.max(0, now - playback.serverTimestamp), playback.durationMs || Number.MAX_SAFE_INTEGER)
    : playback.positionMs;
}

function memorySnapshot(room: MemoryRoom) {
  room.participants = activeParticipants(room.participants);
  return structuredClone(room);
}

async function dbSnapshot(code: string): Promise<RoomSnapshot | null> {
  const db = await getRoomDb();
  if (!db) return null;
  const [room] = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
  if (!room) return null;
  const [peopleRows, queueRows, messageRows, pollRows] = await Promise.all([
    db.select().from(roomParticipants).where(eq(roomParticipants.roomId, room.id)),
    db.select().from(playlistEntries).where(eq(playlistEntries.roomId, room.id)).orderBy(playlistEntries.createdAt),
    db.select().from(chatMessages).where(eq(chatMessages.roomId, room.id)).orderBy(desc(chatMessages.createdAt)).limit(80),
    db.select().from(polls).where(and(eq(polls.roomId, room.id), eq(polls.state, "open"))).orderBy(desc(polls.createdAt)).limit(1),
  ]);
  const pollRow = pollRows[0];
  const votes = pollRow ? await db.select().from(pollVotes).where(eq(pollVotes.pollId, pollRow.id)) : [];
  const pollOptions = pollRow ? parseOptions(pollRow.optionsJson) : [];
  const poll: RoomPoll | null = pollRow ? {
    id: pollRow.id,
    question: pollRow.question,
    options: pollOptions,
    votes: pollOptions.map((_, index) => votes.filter(vote => vote.optionIndex === index).length),
    myVote: null,
    createdBy: pollRow.createdBy,
    createdAt: pollRow.createdAt.getTime(),
  } : null;
  const now = Date.now();
  const participants = peopleRows.map(row => ({
    id: row.participantId,
    name: row.displayName,
    isHost: row.participantId === room.hostId,
    lastSeenAt: row.lastSeenAt.getTime(),
  }));
  return {
    id: room.id,
    code: room.code,
    title: room.title,
    hostId: room.hostId,
    playback: {
      movieId: room.movieId,
      movieTitle: room.movieTitle,
      videoUrl: room.videoUrl,
      durationMs: room.durationMs,
      positionMs: room.positionMs,
      playing: Boolean(room.playing),
      serverTimestamp: room.playbackTimestamp.getTime(),
      revision: room.revision,
    },
    participants: activeParticipants(participants),
    playlist: queueRows.map(row => ({
      id: row.id, movieId: row.movieId, title: row.title, year: row.year, runtime: row.runtime,
      genre: row.genre, addedBy: row.addedBy, createdAt: row.createdAt.getTime(),
    })),
    messages: messageRows.reverse().map(row => ({
      id: row.id, participantId: row.participantId, name: row.displayName, body: row.body, createdAt: row.createdAt.getTime(),
    })),
    poll,
  };
}

function parseOptions(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string").slice(0, 4);
  } catch { /* malformed persisted option data is treated as empty */ }
  return [];
}

async function memberName(code: string, participantId: string) {
  const snapshot = await getRoomSnapshot(code);
  const person = snapshot?.participants.find(candidate => candidate.id === participantId);
  if (!person) throw new Error("You're no longer in this room. Rejoin to continue.");
  return person.name;
}

export async function createRoom(input: { participantId: string; participantToken: string; displayName: string }) {
  const displayName = cleanName(input.displayName);
  if (!/^[0-9a-f-]{36}$/i.test(input.participantId)) throw new Error("This participant session is invalid.");
  const participantTokenHash = hashParticipantToken(input.participantToken);
  let code = roomCode();
  const db = await getRoomDb();
  if (db) {
    for (let i = 0; i < 5; i += 1) {
      const [existing] = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.code, code)).limit(1);
      if (!existing) break;
      code = roomCode();
    }
  }
  const id = randomUUID();
  const now = Date.now();
  const snapshot: RoomSnapshot = {
    id, code, title: "Friday night, together", hostId: input.participantId,
    playback: { movieId: null, movieTitle: null, videoUrl: null, durationMs: 0, positionMs: 0, playing: false, serverTimestamp: now, revision: 0 },
    participants: [{ id: input.participantId, name: displayName, isHost: true, lastSeenAt: now }],
    playlist: [], messages: [], poll: null,
  };
  if (db) {
    await db.transaction(async tx => {
      await tx.insert(rooms).values({ id, code, title: snapshot.title, hostId: input.participantId });
      await tx.insert(roomParticipants).values({ roomId: id, participantId: input.participantId, participantTokenHash, displayName });
    });
  } else {
    memoryRooms.set(code, snapshot);
    memoryTokenHashes.set(`${code}:${input.participantId}`, participantTokenHash);
  }
  return { code, snapshot };
}

export async function joinRoom(codeInput: string, participantId: string, displayNameInput: string, participantToken: string) {
  const code = assertCode(codeInput);
  const displayName = cleanName(displayNameInput);
  if (!/^[0-9a-f-]{36}$/i.test(participantId)) throw new Error("This participant session is invalid.");
  const participantTokenHash = hashParticipantToken(participantToken);
  return withRoomLock(code, async () => {
    const db = await getRoomDb();
    if (db) {
      const snapshot = await dbSnapshot(code);
      if (!snapshot) throw new Error("Room not found. Check the code or ask for a fresh invite.");
      const [prior] = await db.select().from(roomParticipants).where(and(eq(roomParticipants.roomId, snapshot.id), eq(roomParticipants.participantId, participantId))).limit(1);
      if (prior && !sameTokenHash(prior.participantTokenHash, participantTokenHash)) throw new Error("This participant session can't be verified. Restore the original browser session to rejoin.");
      if (!prior && snapshot.participants.length >= ROOM_CAPACITY) throw new Error("This room is full. The current limit is 50 people.");
      const now = new Date();
      await db.insert(roomParticipants).values({ roomId: snapshot.id, participantId, participantTokenHash, displayName, joinedAt: now, lastSeenAt: now }).onDuplicateKeyUpdate({ set: { displayName, lastSeenAt: now } });
      await db.update(rooms).set({ revision: sql`${rooms.revision} + 1` }).where(eq(rooms.id, snapshot.id));
      return (await dbSnapshot(code))!;
    }
    const room = memoryRooms.get(code);
    if (!room) throw new Error("Room not found. Check the code or ask for a fresh invite.");
    const now = Date.now();
    const prior = room.participants.find(person => person.id === participantId);
    const tokenKey = `${code}:${participantId}`;
    const priorHash = memoryTokenHashes.get(tokenKey);
    if ((priorHash && !sameTokenHash(priorHash, participantTokenHash)) || (prior && !priorHash)) throw new Error("This participant session can't be verified. Restore the original browser session to rejoin.");
    const active = activeParticipants(room.participants);
    if (!prior && active.length >= ROOM_CAPACITY) throw new Error("This room is full. The current limit is 50 people.");
    if (prior) {
      prior.name = displayName;
      prior.lastSeenAt = now;
    } else {
      room.participants.push({ id: participantId, name: displayName, isHost: participantId === room.hostId, lastSeenAt: now });
      memoryTokenHashes.set(tokenKey, participantTokenHash);
    }
    room.playback.revision += 1;
    return memorySnapshot(room);
  });
}

export async function getRoomSnapshot(codeInput: string) {
  const code = assertCode(codeInput);
  const db = await getRoomDb();
  if (db) return dbSnapshot(code);
  const room = memoryRooms.get(code);
  return room ? memorySnapshot(room) : null;
}

export async function touchParticipant(codeInput: string, participantId: string) {
  const code = assertCode(codeInput);
  const db = await getRoomDb();
  if (db) {
    const snapshot = await dbSnapshot(code);
    if (!snapshot) throw new Error("Room not found.");
    await db.update(roomParticipants).set({ lastSeenAt: new Date() }).where(and(eq(roomParticipants.roomId, snapshot.id), eq(roomParticipants.participantId, participantId)));
    return;
  }
  const room = memoryRooms.get(code);
  const participant = room?.participants.find(person => person.id === participantId);
  if (!participant) throw new Error("You're no longer in this room. Rejoin to continue.");
  participant.lastSeenAt = Date.now();
}

export async function controlPlayback(input: {
  code: string; participantId: string; actionId: string; action: "play" | "pause" | "seek" | "select" | "source"; positionMs?: number; movieId?: string; movieTitle?: string; videoUrl?: string;
}) {
  const code = assertCode(input.code);
  const key = `${code}:${input.actionId}`;
  const cached = actionResults.get(key);
  if (cached && Date.now() - cached.at < 300_000) {
    const snapshot = await getRoomSnapshot(code);
    return { snapshot, result: cached.result };
  }
  return withRoomLock(code, async () => {
    const repeated = actionResults.get(key);
    if (repeated && Date.now() - repeated.at < 300_000) {
      return { snapshot: await getRoomSnapshot(code), result: repeated.result };
    }
    const db = await getRoomDb();
    const snapshot = await getRoomSnapshot(code);
    if (!snapshot) throw new Error("Room not found.");
    if (snapshot.hostId !== input.participantId) throw new Error("Only the host can control playback.");
    let movie = null;
    if (input.action === "select") {
      movie = await getCatalogMovie(input.movieId ?? "");
      if (!movie) throw new Error("That film isn't in the room catalogue.");
    }
    const now = Date.now();
    let positionMs = playbackPosition(snapshot.playback, now);
    let playing = snapshot.playback.playing;
    let movieId = snapshot.playback.movieId;
    let movieTitle = snapshot.playback.movieTitle;
    let videoUrl = snapshot.playback.videoUrl;
    let durationMs = snapshot.playback.durationMs;
    if (input.action === "source") {
      const playableUrl = normalizePlayableUrl(input.videoUrl ?? "");
      if (!playableUrl) throw new Error("Use a YouTube link or a direct HTTPS link to an MP4, WebM, or Ogg video file.");
      movieTitle = (input.movieTitle?.trim().replace(/[<>\u0000-\u001f]/g, "") || "Shared video").slice(0, 120);
      videoUrl = playableUrl;
      durationMs = 0;
      positionMs = 0;
      playing = false;
    }
    if (input.action === "select" && movie) {
      movieId = movie.id;
      movieTitle = movie.title;
      videoUrl = movie.videoUrl ? normalizePlayableUrl(movie.videoUrl) : null;
      durationMs = movie.runtime * 60_000;
      positionMs = 0;
      playing = false;
    } else if (input.action === "play") {
      playing = true;
    } else if (input.action === "pause") {
      playing = false;
    } else if (input.action === "seek") {
      positionMs = Math.max(0, Math.min(durationMs || Number.MAX_SAFE_INTEGER, Math.round(input.positionMs ?? 0)));
    }
    const revision = snapshot.playback.revision + 1;
    if (db) {
      await db.update(rooms).set({ movieId, movieTitle, videoUrl, durationMs, positionMs, playing: playing ? 1 : 0, revision, playbackTimestamp: new Date(now), updatedAt: new Date(now) }).where(eq(rooms.id, snapshot.id));
    } else {
      const room = memoryRooms.get(code)!;
      room.playback = { movieId, movieTitle, videoUrl, durationMs, positionMs, playing, serverTimestamp: now, revision };
    }
    const result: ActionAck = { ok: true, revision };
    actionResults.set(key, { at: now, result });
    if (actionResults.size > 5_000) {
      for (const [id, value] of actionResults) if (now - value.at > 300_000) actionResults.delete(id);
      if (actionResults.size > 5_000) actionResults.delete(actionResults.keys().next().value!);
    }
    return { snapshot: (await getRoomSnapshot(code))!, result };
  });
}

export async function addMessage(codeInput: string, participantId: string, bodyInput: string) {
  const code = assertCode(codeInput);
  const body = bodyInput.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, 320);
  if (!body) throw new Error("Write a message before sending.");
  return withRoomLock(code, async () => {
    const name = await memberName(code, participantId);
    const id = randomUUID();
    const createdAt = Date.now();
    const db = await getRoomDb();
    if (db) {
      const [room] = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.code, code)).limit(1);
      if (!room) throw new Error("Room not found.");
      await db.insert(chatMessages).values({ id, roomId: room.id, participantId, displayName: name, body });
      await db.update(rooms).set({ revision: sql`${rooms.revision} + 1` }).where(eq(rooms.id, room.id));
    } else {
      const room = memoryRooms.get(code)!;
      room.messages.push({ id, participantId, name, body, createdAt });
      room.messages = room.messages.slice(-80);
      room.playback.revision += 1;
    }
    return getRoomSnapshot(code);
  });
}

export async function addReaction(codeInput: string, participantId: string, emoji: string) {
  const code = assertCode(codeInput);
  if (!["❤️", "😂", "👏", "🔥", "😮", "😭", "🍿", "✨"].includes(emoji)) throw new Error("Choose a reaction from the room palette.");
  const name = await memberName(code, participantId);
  return { participantId, name, emoji, createdAt: Date.now() };
}

export async function addPlaylistMovie(codeInput: string, participantId: string, movieId: string) {
  const code = assertCode(codeInput);
  return withRoomLock(code, async () => {
    await memberName(code, participantId);
    const movie = await getCatalogMovie(movieId);
    if (!movie) throw new Error("That film isn't in the room catalogue.");
    const db = await getRoomDb();
    const id = randomUUID();
    const createdAt = Date.now();
    if (db) {
      const [room] = await db.select({ id: rooms.id }).from(rooms).where(eq(rooms.code, code)).limit(1);
      if (!room) throw new Error("Room not found.");
      const [existing] = await db.select({ id: playlistEntries.id }).from(playlistEntries).where(and(eq(playlistEntries.roomId, room.id), eq(playlistEntries.movieId, movie.id))).limit(1);
      if (existing) return getRoomSnapshot(code);
      await db.insert(playlistEntries).values({ id, roomId: room.id, movieId: movie.id, title: movie.title, year: movie.year, runtime: movie.runtime, genre: movie.genre, addedBy: participantId });
      await db.update(rooms).set({ revision: sql`${rooms.revision} + 1` }).where(eq(rooms.id, room.id));
    } else {
      const room = memoryRooms.get(code)!;
      if (room.playlist.some(entry => entry.movieId === movie.id)) return memorySnapshot(room);
      room.playlist.push({ id, movieId, title: movie.title, year: movie.year, runtime: movie.runtime, genre: movie.genre, addedBy: participantId, createdAt });
      room.playback.revision += 1;
    }
    return getRoomSnapshot(code);
  });
}

export async function createPoll(codeInput: string, participantId: string, questionInput: string, optionsInput: string[]) {
  const code = assertCode(codeInput);
  const question = questionInput.trim().slice(0, 240);
  const options = optionsInput.map(value => value.trim().slice(0, 80)).filter(Boolean).slice(0, 4);
  if (!question || options.length < 2) throw new Error("A poll needs a question and at least two options.");
  return withRoomLock(code, async () => {
    const db = await getRoomDb();
    const id = randomUUID();
    const createdAt = Date.now();
    if (db) {
      const snapshot = await getRoomSnapshot(code);
      if (!snapshot) throw new Error("Room not found.");
      await db.update(polls).set({ state: "closed" }).where(and(eq(polls.roomId, snapshot.id), eq(polls.state, "open")));
      await db.insert(polls).values({ id, roomId: snapshot.id, question, optionsJson: JSON.stringify(options), createdBy: participantId });
      await db.update(rooms).set({ revision: sql`${rooms.revision} + 1` }).where(eq(rooms.id, snapshot.id));
    } else {
      const room = memoryRooms.get(code);
      if (!room) throw new Error("Room not found.");
      room.poll = { id, question, options, votes: options.map(() => 0), myVote: null, createdBy: participantId, createdAt };
      room.playback.revision += 1;
    }
    return getRoomSnapshot(code);
  });
}

export async function votePoll(codeInput: string, participantId: string, pollId: string, optionIndex: number) {
  const code = assertCode(codeInput);
  return withRoomLock(code, async () => {
    const db = await getRoomDb();
    if (db) {
      const snapshot = await getRoomSnapshot(code);
      if (!snapshot?.poll || snapshot.poll.id !== pollId) throw new Error("That poll is no longer open.");
      if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= snapshot.poll.options.length) throw new Error("That poll option isn't valid.");
      await db.insert(pollVotes).values({ pollId, participantId, optionIndex }).onDuplicateKeyUpdate({ set: { optionIndex, updatedAt: new Date() } });
      await db.update(rooms).set({ revision: sql`${rooms.revision} + 1` }).where(eq(rooms.id, snapshot.id));
    } else {
      const room = memoryRooms.get(code);
      const poll = room?.poll;
      if (!poll || poll.id !== pollId) throw new Error("That poll is no longer open.");
      if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) throw new Error("That poll option isn't valid.");
      const memoryPoll = poll as RoomPoll & { voterChoices?: Record<string, number> };
      const voterChoices = memoryPoll.voterChoices ??= {};
      const previous = voterChoices[participantId];
      if (previous !== undefined) poll.votes[previous] = Math.max(0, poll.votes[previous] - 1);
      voterChoices[participantId] = optionIndex;
      poll.votes[optionIndex] += 1;
      poll.myVote = optionIndex;
      room!.playback.revision += 1;
    }
    return getRoomSnapshot(code);
  });
}

export async function transferHost(codeInput: string, participantId: string, targetParticipantId: string) {
  const code = assertCode(codeInput);
  return withRoomLock(code, async () => {
    const snapshot = await getRoomSnapshot(code);
    if (!snapshot) throw new Error("Room not found.");
    if (snapshot.hostId !== participantId) throw new Error("Only the current host can transfer hosting.");
    if (!snapshot.participants.some(person => person.id === targetParticipantId)) throw new Error("That participant has left the room.");
    const db = await getRoomDb();
    const now = Date.now();
    const positionMs = playbackPosition(snapshot.playback, now);
    const revision = snapshot.playback.revision + 1;
    if (db) await db.update(rooms).set({ hostId: targetParticipantId, positionMs, revision, playbackTimestamp: new Date(now), updatedAt: new Date(now) }).where(eq(rooms.id, snapshot.id));
    else {
      const room = memoryRooms.get(code)!;
      room.hostId = targetParticipantId;
      room.participants = room.participants.map(person => ({ ...person, isHost: person.id === targetParticipantId }));
      room.playback = { ...room.playback, positionMs, revision, serverTimestamp: now };
    }
    return getRoomSnapshot(code);
  });
}

export function currentPosition(playback: PlaybackState, now = Date.now()) {
  return playbackPosition(playback, now);
}
