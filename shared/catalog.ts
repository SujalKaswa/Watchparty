export type MovieIndustry = "Bollywood" | "Hollywood";

export const MAX_CATALOG_MOVIES = 30;
export type PlaybackSourceType = "official" | "public-domain";

export type Movie = {
  id: string;
  title: string;
  industry: MovieIndustry;
  year: number;
  runtime: number;
  /** Primary genre retained for compact room and playlist labels. */
  genre: string;
  /** Complete normalized genre facets returned by the catalog API. */
  genres: string[];
  videoUrl?: string | null;
  playbackSourceType?: PlaybackSourceType | null;
  playbackSourceUrl?: string | null;
  playbackRightsNote?: string | null;
  mood: string;
  synopsis: string;
  palette: [string, string];
  posterUrl: string;
  posterSourceUrl: string;
  metadataSourceUrls: string[];
  featured: boolean;
};

export function fuzzyScore(query: string, candidate: string) {
  const needle = query.trim().toLowerCase();
  const haystack = candidate.toLowerCase();
  if (!needle) return 1;
  if (haystack.includes(needle)) return 10 - Math.min(needle.length, 8) / 10;
  let i = 0;
  let streak = 0;
  let score = 0;
  for (const char of haystack) {
    if (char === needle[i]) {
      i += 1;
      streak += 1;
      score += 1 + streak * 0.25;
      if (i === needle.length) return score - Math.max(haystack.length - needle.length, 0) * 0.025;
    } else {
      streak = 0;
    }
  }
  const distance = (left: string, right: string) => {
    const row = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i += 1) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= right.length; j += 1) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return row[right.length];
  };
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  const nearest = Math.min(distance(needle, haystack), ...words.map(word => distance(needle, word)));
  const allowance = Math.max(1, Math.min(3, Math.floor(needle.length * 0.28)));
  return nearest <= allowance ? 5 - nearest + Math.max(0, 1 - haystack.length / 100) : 0;
}

export function filterMovies(movies: Movie[], query: string, industry: string, genre: string, mood: string, underThreeHours: boolean) {
  const needle = query.trim();
  const exactIndustry = (["Bollywood", "Hollywood"] as const).find(name => name.toLowerCase() === needle.toLowerCase());
  return movies.map(movie => ({
    movie,
    score: [movie.title, movie.industry, ...movie.genres, movie.mood, movie.synopsis]
      .map(field => fuzzyScore(needle, field))
      .reduce((max, value) => Math.max(max, value), 0),
  }))
    .filter(({ movie, score }) =>
      (!needle || score > 0)
      && (!exactIndustry || movie.industry === exactIndustry)
      && (industry === "All industries" || movie.industry === industry)
      && (genre === "All genres" || movie.genres.includes(genre))
      && (mood === "Any mood" || movie.mood === mood)
      && (!underThreeHours || movie.runtime < 180))
    .sort((a, b) => needle ? b.score - a.score : Number(Boolean(b.movie.featured)) - Number(Boolean(a.movie.featured)))
    .map(({ movie }) => movie);
}
