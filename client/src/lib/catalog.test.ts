import { describe, expect, it } from "vitest";
import { filterMovies, MAX_CATALOG_MOVIES, type Movie } from "../../../shared/catalog";

const movies: Movie[] = [
  { id: "sample-bolly", title: "Three Idiots", industry: "Bollywood", year: 2009, runtime: 170, genre: "Comedy", genres: ["Comedy", "Drama"], mood: "Uplifting", synopsis: "Three engineering students challenge convention.", palette: ["#c45d3f", "#322642"], posterUrl: "/posters/three-idiots.jpg", posterSourceUrl: "https://example.com/poster", metadataSourceUrls: [], featured: true },
  { id: "sample-hollywood", title: "Interstellar", industry: "Hollywood", year: 2014, runtime: 169, genre: "Science Fiction", genres: ["Science Fiction", "Adventure", "Drama"], mood: "Awe-inspiring", synopsis: "Explorers search for a future among the stars.", palette: ["#233244", "#080e18"], posterUrl: "/posters/interstellar.jpg", posterSourceUrl: "https://example.com/poster", metadataSourceUrls: [], featured: true },
];

describe("database-loaded catalog filtering", () => {
  it("caps the curated database catalog at 30 movies", () => {
    expect(MAX_CATALOG_MOVIES).toBe(30);
  });

  it("distinguishes Bollywood and Hollywood without hiding the unfiltered catalog", () => {
    expect(filterMovies(movies, "", "All industries", "All genres", "Any mood", false).map(movie => movie.id)).toEqual(["sample-bolly", "sample-hollywood"]);
    expect(filterMovies(movies, "", "Bollywood", "All genres", "Any mood", false).map(movie => movie.id)).toEqual(["sample-bolly"]);
    expect(filterMovies(movies, "", "Hollywood", "All genres", "Any mood", false).map(movie => movie.id)).toEqual(["sample-hollywood"]);
  });

  it("combines industry and any matching normalized genre", () => {
    expect(filterMovies(movies, "", "Hollywood", "Adventure", "Any mood", false).map(movie => movie.id)).toEqual(["sample-hollywood"]);
    expect(filterMovies(movies, "", "Bollywood", "Adventure", "Any mood", false)).toEqual([]);
  });

  it("finds misspellings across titles and metadata", () => {
    expect(filterMovies(movies, "interstllar", "All industries", "All genres", "Any mood", false).map(movie => movie.id)).toEqual(["sample-hollywood"]);
    expect(filterMovies(movies, "Bollywood", "All industries", "All genres", "Any mood", false).map(movie => movie.id)).toEqual(["sample-bolly"]);
    expect(filterMovies(movies, "Hollywood", "All industries", "All genres", "Any mood", false).map(movie => movie.id)).toEqual(["sample-hollywood"]);
  });

  it("retains the mood and useful runtime filters", () => {
    expect(filterMovies(movies, "", "All industries", "All genres", "Uplifting", false).map(movie => movie.id)).toEqual(["sample-bolly"]);
    const longerEpic = { ...movies[0], id: "sample-long", title: "Long epic", runtime: 224 };
    expect(filterMovies([...movies, longerEpic], "", "All industries", "All genres", "Any mood", true).map(movie => movie.id)).toEqual(["sample-bolly", "sample-hollywood"]);
  });
});
