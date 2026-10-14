import { asc, desc, eq } from "drizzle-orm";
import { MAX_CATALOG_MOVIES, type Movie } from "@shared/catalog";
import { catalogMovieGenres, catalogMovies } from "../drizzle/schema";
import { getDb } from "./db";
import { MOVIE_SEEDS } from "./catalog-seed";

function parseStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parsePalette(value: string): [string, string] {
  const parsed = parseStringArray(value);
  return parsed.length >= 2 ? [parsed[0], parsed[1]] : ["#e86d4b", "#34213f"];
}

function toMovie(row: typeof catalogMovies.$inferSelect, genres: string[]): Movie {
  const completeGenres = Array.from(new Set([row.genre, ...genres]));
  return {
    id: row.id,
    title: row.title,
    industry: row.industry,
    year: row.year,
    runtime: row.runtime,
    genre: row.genre,
    genres: completeGenres,
    videoUrl: row.videoUrl,
    playbackSourceType: row.playbackSourceType,
    playbackSourceUrl: row.playbackSourceUrl,
    playbackRightsNote: row.playbackRightsNote,
    mood: row.mood,
    synopsis: row.synopsis,
    palette: parsePalette(row.paletteJson),
    posterUrl: row.posterUrl,
    posterSourceUrl: row.posterSourceUrl,
    metadataSourceUrls: parseStringArray(row.metadataSourcesJson),
    featured: Boolean(row.featured),
  };
}

function getSeedMovie(id: string) {
  const movie = MOVIE_SEEDS.find(candidate => candidate.id === id);
  return movie ? { ...movie, genres: [...movie.genres], palette: [...movie.palette] as [string, string] } : null;
}

export async function getCatalogMovies(): Promise<Movie[]> {
  const db = await getDb();
  if (!db) {
    if (process.env.REELROOM_EPHEMERAL === "1") return MOVIE_SEEDS.slice(0, MAX_CATALOG_MOVIES).map(movie => ({ ...movie, genres: [...movie.genres], palette: [...movie.palette] as [string, string] }));
    throw new Error("Movie catalog storage is unavailable.");
  }
  const [rows, genreRows] = await Promise.all([
    db.select().from(catalogMovies).orderBy(desc(catalogMovies.featured), asc(catalogMovies.title)).limit(MAX_CATALOG_MOVIES),
    db.select().from(catalogMovieGenres).orderBy(asc(catalogMovieGenres.genre)),
  ]);
  const genresByMovie = new Map<string, string[]>();
  for (const row of genreRows) genresByMovie.set(row.movieId, [...(genresByMovie.get(row.movieId) ?? []), row.genre]);
  return rows.map(row => toMovie(row, genresByMovie.get(row.id) ?? []));
}

export async function getCatalogMovie(id: string): Promise<Movie | null> {
  const db = await getDb();
  if (!db) {
    if (process.env.REELROOM_EPHEMERAL === "1") return getSeedMovie(id);
    throw new Error("Movie catalog storage is unavailable.");
  }
  const [row] = await db.select().from(catalogMovies).where(eq(catalogMovies.id, id)).limit(1);
  if (!row) return null;
  const genreRows = await db.select().from(catalogMovieGenres).where(eq(catalogMovieGenres.movieId, id)).orderBy(asc(catalogMovieGenres.genre));
  return toMovie(row, genreRows.map(item => item.genre));
}
