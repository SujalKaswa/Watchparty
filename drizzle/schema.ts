import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Core user table retained for the starter's optional account flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const rooms = mysqlTable("watch_rooms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  hostId: varchar("hostId", { length: 36 }).notNull(),
  movieId: varchar("movieId", { length: 64 }),
  movieTitle: varchar("movieTitle", { length: 120 }),
  videoUrl: varchar("videoUrl", { length: 500 }),
  durationMs: int("durationMs").default(0).notNull(),
  positionMs: int("positionMs").default(0).notNull(),
  playing: int("playing").default(0).notNull(),
  playbackTimestamp: timestamp("playbackTimestamp", { fsp: 3 }).defaultNow().notNull(),
  revision: int("revision").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const roomParticipants = mysqlTable("watch_room_participants", {
  id: int("id").autoincrement().primaryKey(),
  roomId: varchar("roomId", { length: 36 }).notNull(),
  participantId: varchar("participantId", { length: 36 }).notNull(),
  participantTokenHash: varchar("participantTokenHash", { length: 64 }).default("").notNull(),
  displayName: varchar("displayName", { length: 32 }).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
}, table => ({
  roomParticipant: uniqueIndex("watch_room_participant_unique").on(table.roomId, table.participantId),
  byRoom: index("watch_room_participants_room_idx").on(table.roomId, table.lastSeenAt),
}));

export const playlistEntries = mysqlTable("watch_playlist_entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roomId: varchar("roomId", { length: 36 }).notNull(),
  movieId: varchar("movieId", { length: 64 }).notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  year: int("year").notNull(),
  runtime: int("runtime").notNull(),
  genre: varchar("genre", { length: 32 }).notNull(),
  addedBy: varchar("addedBy", { length: 36 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ byRoom: index("watch_playlist_room_idx").on(table.roomId, table.createdAt) }));

export const chatMessages = mysqlTable("watch_room_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roomId: varchar("roomId", { length: 36 }).notNull(),
  participantId: varchar("participantId", { length: 36 }).notNull(),
  displayName: varchar("displayName", { length: 32 }).notNull(),
  body: varchar("body", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ byRoom: index("watch_room_messages_room_idx").on(table.roomId, table.createdAt) }));

export const polls = mysqlTable("watch_room_polls", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roomId: varchar("roomId", { length: 36 }).notNull(),
  question: varchar("question", { length: 240 }).notNull(),
  optionsJson: text("optionsJson").notNull(),
  createdBy: varchar("createdBy", { length: 36 }).notNull(),
  state: mysqlEnum("state", ["open", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ byRoom: index("watch_room_polls_room_idx").on(table.roomId, table.createdAt) }));

export const pollVotes = mysqlTable("watch_room_poll_votes", {
  id: int("id").autoincrement().primaryKey(),
  pollId: varchar("pollId", { length: 36 }).notNull(),
  participantId: varchar("participantId", { length: 36 }).notNull(),
  optionIndex: int("optionIndex").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  pollParticipant: uniqueIndex("watch_poll_participant_unique").on(table.pollId, table.participantId),
  byPoll: index("watch_poll_votes_poll_idx").on(table.pollId),
}));

export const catalogMovies = mysqlTable("catalog_movies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  industry: mysqlEnum("industry", ["Bollywood", "Hollywood"]).notNull(),
  year: int("year").notNull(),
  runtime: int("runtime").notNull(),
  genre: varchar("genre", { length: 32 }).notNull(),
  mood: varchar("mood", { length: 32 }).notNull(),
  synopsis: text("synopsis").notNull(),
  posterUrl: varchar("posterUrl", { length: 500 }).notNull(),
  posterSourceUrl: text("posterSourceUrl").notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }),
  playbackSourceType: mysqlEnum("playbackSourceType", ["official", "public-domain"]),
  playbackSourceUrl: text("playbackSourceUrl"),
  playbackRightsNote: varchar("playbackRightsNote", { length: 512 }),
  metadataSourcesJson: text("metadataSourcesJson").notNull(),
  paletteJson: varchar("paletteJson", { length: 80 }).notNull(),
  featured: int("featured").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  byIndustryYear: index("catalog_movies_industry_year_idx").on(table.industry, table.year),
  byGenre: index("catalog_movies_genre_idx").on(table.genre),
}));

export const catalogMovieGenres = mysqlTable("catalog_movie_genres", {
  id: int("id").autoincrement().primaryKey(),
  movieId: varchar("movieId", { length: 64 }).notNull(),
  genre: varchar("genre", { length: 32 }).notNull(),
}, table => ({
  uniqueMovieGenre: uniqueIndex("catalog_movie_genre_unique").on(table.movieId, table.genre),
  byGenre: index("catalog_movie_genres_genre_idx").on(table.genre, table.movieId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
