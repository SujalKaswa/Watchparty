import { createConnection } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { and, eq, isNull, sql } from "drizzle-orm";
import { MAX_CATALOG_MOVIES } from "../shared/catalog";
import { catalogMovieGenres, catalogMovies } from "../drizzle/schema";
import { MOVIE_SEEDS } from "../server/catalog-seed";
import { normalizePlayableUrl } from "../shared/video";

function validatePlaybackSources() {
  if (MOVIE_SEEDS.length !== MAX_CATALOG_MOVIES) {
    throw new Error(`Expected exactly ${MAX_CATALOG_MOVIES} curated movies; found ${MOVIE_SEEDS.length}.`);
  }
  const industryCounts = MOVIE_SEEDS.reduce((counts, movie) => {
    counts[movie.industry] += 1;
    return counts;
  }, { Bollywood: 0, Hollywood: 0 });
  if (industryCounts.Bollywood !== 15 || industryCounts.Hollywood !== 15) {
    throw new Error(`Expected 15 Bollywood and 15 Hollywood movies; found ${industryCounts.Bollywood} and ${industryCounts.Hollywood}.`);
  }
  if (new Set(MOVIE_SEEDS.map(movie => movie.id)).size !== MOVIE_SEEDS.length) {
    throw new Error("The curated catalog contains duplicate movie IDs.");
  }
  for (const movie of MOVIE_SEEDS.slice(0, MAX_CATALOG_MOVIES)) {
    const fields = [movie.videoUrl, movie.playbackSourceType, movie.playbackSourceUrl, movie.playbackRightsNote];
    if (fields.every(value => !value)) continue;
    const normalizedVideoUrl = movie.videoUrl ? normalizePlayableUrl(movie.videoUrl) : null;
    let evidenceUrl: URL | null = null;
    try { evidenceUrl = movie.playbackSourceUrl ? new URL(movie.playbackSourceUrl) : null; } catch { /* invalid evidence */ }
    if (!normalizedVideoUrl || !movie.playbackSourceType || !evidenceUrl || evidenceUrl.protocol !== "https:" || evidenceUrl.username || evidenceUrl.password || !movie.playbackRightsNote?.trim() || movie.playbackRightsNote.length > 512) {
      throw new Error(`Movie ${movie.id} has incomplete or unsupported playback-source evidence.`);
    }
  }
}

async function seedCatalog() {
  validatePlaybackSources();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the movie catalog.");

  const connection = await createConnection(databaseUrl);
  try {
    const db = drizzle(connection);
    let processed = 0;

    for (const movie of MOVIE_SEEDS.slice(0, MAX_CATALOG_MOVIES)) {
      await db.transaction(async tx => {
        await tx.insert(catalogMovies).values({
          id: movie.id,
          title: movie.title,
          industry: movie.industry,
          year: movie.year,
          runtime: movie.runtime,
          genre: movie.genre,
          mood: movie.mood,
          synopsis: movie.synopsis,
          posterUrl: movie.posterUrl,
          posterSourceUrl: movie.posterSourceUrl,
          videoUrl: movie.videoUrl ? normalizePlayableUrl(movie.videoUrl) : null,
          playbackSourceType: movie.playbackSourceType ?? null,
          playbackSourceUrl: movie.playbackSourceUrl ?? null,
          playbackRightsNote: movie.playbackRightsNote ?? null,
          metadataSourcesJson: JSON.stringify(movie.metadataSourceUrls),
          paletteJson: JSON.stringify(movie.palette),
          featured: movie.featured ? 1 : 0,
        }).onDuplicateKeyUpdate({ set: { id: sql`id` } });
        await tx.insert(catalogMovieGenres).values(movie.genres.map((genre: string) => ({ movieId: movie.id, genre })))
          .onDuplicateKeyUpdate({ set: { id: sql`id` } });
        if (movie.videoUrl && movie.playbackSourceType && movie.playbackSourceUrl) {
          await tx.update(catalogMovies)
            .set({ videoUrl: normalizePlayableUrl(movie.videoUrl)!, playbackSourceType: movie.playbackSourceType, playbackSourceUrl: movie.playbackSourceUrl, playbackRightsNote: movie.playbackRightsNote ?? null })
            .where(and(
              eq(catalogMovies.id, movie.id),
              isNull(catalogMovies.videoUrl),
              isNull(catalogMovies.playbackSourceType),
              isNull(catalogMovies.playbackSourceUrl),
              isNull(catalogMovies.playbackRightsNote),
            ));
        }
        processed += 1;
      });
    }

    console.log(`Catalog seed complete: ${processed} of up to ${MAX_CATALOG_MOVIES} source records processed; existing movie fields and genre links are preserved, and playback sources are backfilled only when all source fields are empty.`);
  } finally {
    await connection.end();
  }
}

seedCatalog().catch(error => {
  console.error("Catalog seed failed:", error instanceof Error ? error.message : "Unknown database error.");
  process.exitCode = 1;
});
