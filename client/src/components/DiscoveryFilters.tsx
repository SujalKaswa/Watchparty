import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo } from "react";
import type { Movie } from "@shared/catalog";

export function DiscoveryFilters({ movies, query, setQuery, industry, setIndustry, genre, setGenre, mood, setMood, underThreeHours, setUnderThreeHours }: {
  movies: Movie[];
  query: string; setQuery: (value: string) => void;
  industry: string; setIndustry: (value: string) => void;
  genre: string; setGenre: (value: string) => void;
  mood: string; setMood: (value: string) => void;
  underThreeHours: boolean; setUnderThreeHours: (value: boolean) => void;
}) {
  const industries = ["All industries", "Bollywood", "Hollywood"];
  const genres = useMemo(() => ["All genres", ...Array.from(new Set(movies.flatMap(movie => movie.genres))).sort((a, b) => a.localeCompare(b))], [movies]);
  const moods = useMemo(() => ["Any mood", ...Array.from(new Set(movies.map(movie => movie.mood))).sort((a, b) => a.localeCompare(b))], [movies]);

  return (
    <div className="discovery-controls">
      <label className="search-field"><Search size={17} /><input id="movie-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, industry, genre, or mood" aria-label="Search movies" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}<kbd>⌘ K</kbd></label>
      <div className="filter-line"><SlidersHorizontal size={15} /><span>Refine</span>
        <select aria-label="Filter film industry" value={industry} onChange={event => setIndustry(event.target.value)}>{industries.map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter genre" value={genre} onChange={event => setGenre(event.target.value)}>{genres.map(item => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter mood" value={mood} onChange={event => setMood(event.target.value)}>{moods.map(item => <option key={item}>{item}</option>)}</select>
        <button className={`filter-pill${underThreeHours ? " is-selected" : ""}`} onClick={() => setUnderThreeHours(!underThreeHours)}>{underThreeHours ? "✓ " : ""}Under 3 hours</button>
      </div>
    </div>
  );
}
