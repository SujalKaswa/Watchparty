import type { CSSProperties } from "react";
import type { Movie } from "@shared/catalog";

export function MovieArt({ movie, compact = false }: { movie: Pick<Movie, "title" | "year" | "genre" | "palette" | "posterUrl">; compact?: boolean }) {
  const style = { "--cover-a": movie.palette[0], "--cover-b": movie.palette[1] } as CSSProperties;
  return (
    <div className={`movie-art${compact ? " movie-art--compact" : ""}`} style={style} aria-label={`${movie.title} ${movie.year} ${movie.genre}`}>
      <img className="movie-art__poster" src={movie.posterUrl} alt="" loading="lazy" />
      <div className="movie-art__scrim" />
      <div className="movie-art__halo" />
      <div className="movie-art__grain" />
      <span className="movie-art__eyebrow">REELROOM SELECTS · {movie.year}</span>
      <strong>{movie.title}</strong>
      <span className="movie-art__genre">{movie.genre}</span>
      <span className="movie-art__mark" aria-hidden="true">✦</span>
    </div>
  );
}
