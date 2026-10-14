import type { Movie } from "./catalog";

export type PlaybackState = {
  movieId: string | null;
  movieTitle: string | null;
  videoUrl: string | null;
  durationMs: number;
  positionMs: number;
  playing: boolean;
  serverTimestamp: number;
  revision: number;
};

export type Participant = {
  id: string;
  name: string;
  isHost: boolean;
  lastSeenAt: number;
};

export type ChatMessage = {
  id: string;
  participantId: string;
  name: string;
  body: string;
  createdAt: number;
};

export type PlaylistItem = {
  id: string;
  movieId: string;
  title: string;
  year: number;
  runtime: number;
  genre: string;
  addedBy: string;
  createdAt: number;
};

export type RoomPoll = {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  myVote: number | null;
  createdBy: string;
  createdAt: number;
};

export type RoomSnapshot = {
  id: string;
  code: string;
  title: string;
  hostId: string;
  playback: PlaybackState;
  participants: Participant[];
  playlist: PlaylistItem[];
  messages: ChatMessage[];
  poll: RoomPoll | null;
};

export type ActionAck = { ok: true; revision?: number } | { ok: false; error: string };

export type RoomAction = {
  code: string;
  participantId: string;
  actionId: string;
};

export type ServerToClientEvents = {
  "room:snapshot": (snapshot: RoomSnapshot) => void;
  "room:update": (message: { snapshot: RoomSnapshot; actionId?: string; acceptedAt: number }) => void;
  "room:clock": (message: { serverTime: number; clientSentAt?: number; clientEpoch?: number }) => void;
  "room:error": (message: string) => void;
  "room:reaction": (reaction: { participantId: string; name: string; emoji: string; createdAt: number }) => void;
  "room:ack": (result: ActionAck & { actionId: string; sentAt?: number; acceptedAt?: number }) => void;
};

export type ClientToServerEvents = {
  "room:join": (payload: { code: string; participantId: string; participantToken: string; displayName: string; clientSentAt?: number; clientEpoch?: number }) => void;
  "room:heartbeat": (payload: { code: string; participantId: string; clientSentAt?: number; clientEpoch?: number }) => void;
  "playback:control": (payload: RoomAction & { action: "play" | "pause" | "seek" | "select" | "source"; positionMs?: number; movieId?: string; movieTitle?: string; videoUrl?: string }) => void;
  "chat:send": (payload: RoomAction & { body: string }) => void;
  "reaction:send": (payload: RoomAction & { emoji: string }) => void;
  "playlist:add": (payload: RoomAction & { movieId: string }) => void;
  "poll:create": (payload: RoomAction & { question: string; options: string[] }) => void;
  "poll:vote": (payload: RoomAction & { pollId: string; optionIndex: number }) => void;
  "host:transfer": (payload: RoomAction & { targetParticipantId: string }) => void;
};

export type MovieRecord = Pick<Movie, "id" | "title" | "year" | "runtime" | "genre">;
