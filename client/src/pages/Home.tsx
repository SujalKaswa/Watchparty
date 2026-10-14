import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowDownRight, ArrowRight, Check, Clapperboard, Film, Search, Sparkles, Users, X } from "lucide-react";
import { toast } from "sonner";
import { filterMovies, type Movie } from "@shared/catalog";
import { Brand } from "@/components/Brand";
import { DiscoveryFilters } from "@/components/DiscoveryFilters";
import { MovieArt } from "@/components/MovieArt";
import { getParticipantId, getParticipantToken, getDisplayName, saveDisplayName } from "@/lib/identity";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState(getDisplayName());
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [genre, setGenre] = useState("All genres");
  const [mood, setMood] = useState("Any mood");
  const [underThreeHours, setUnderThreeHours] = useState(false);
  const catalogQuery = trpc.catalog.list.useQuery();
  const movies = catalogQuery.data ?? [];
  const createRoom = trpc.room.create.useMutation();
  const results = useMemo(() => filterMovies(movies, query, industry, genre, mood, underThreeHours), [movies, query, industry, genre, mood, underThreeHours]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("movie-search")?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const startRoom = async (movie?: Movie) => {
    const displayName = saveDisplayName(name);
    if (!displayName) { toast.error("Add your name first."); return; }
    try {
      const room = await createRoom.mutateAsync({ participantId: getParticipantId(), participantToken: getParticipantToken(), displayName });
      setLocation(`/r/${room.code}${movie ? `?film=${encodeURIComponent(movie.id)}` : ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The room couldn't be created.");
    }
  };

  const joinRoom = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{6}$/.test(clean)) { toast.error("Room codes are six letters or numbers."); return; }
    saveDisplayName(name);
    setLocation(`/r/${clean}`);
  };

  const featured = results.filter(movie => movie.featured).sort((a, b) => Number(Boolean(b.videoUrl)) - Number(Boolean(a.videoUrl)));
  const rest = results.filter(movie => !featured.some(featuredMovie => featuredMovie.id === movie.id)).sort((a, b) => Number(Boolean(b.videoUrl)) - Number(Boolean(a.videoUrl)));
  const heroMovie = movies.find(movie => movie.featured) ?? movies[0];

  return (
    <div className="site-shell home-page">
      <header className="topbar">
        <Brand />
        <nav className="topnav"><a className="topnav__active" href="#discover">Discover</a><a href="#how-it-works">How it works</a></nav>
        <button className="profile-chip" onClick={() => document.getElementById("display-name")?.focus()}><span className="profile-chip__avatar">{name.slice(0, 1).toUpperCase()}</span><span>{name || "Your name"}</span></button>
      </header>

      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow__dash" /> YOUR SEAT IS SAVED <span className="eyebrow__spark">✳</span></div>
            <h1>Good films.<br /><em>Better together.</em></h1>
            <p className="hero-subtitle">Pick a film, pass the popcorn emoji, and press play at the same moment—even from a thousand miles apart.</p>
            <div className="hero-actions"><button className="button button--ember button--large" onClick={() => void startRoom()} disabled={createRoom.isPending}>{createRoom.isPending ? <span className="spinner" /> : <Clapperboard size={17} />} {createRoom.isPending ? "Opening your room…" : "Create a watch room"}<ArrowRight size={16} /></button><a href="#discover" className="text-link">Find tonight's film <ArrowDownRight size={15} /></a></div>
            <div className="hero-social"><div className="mini-faces"><i>A</i><i>M</i><i>J</i><i>+</i></div><span>Good company, <b>wherever you are</b></span></div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel__orbit hero-panel__orbit--one" /><div className="hero-panel__orbit hero-panel__orbit--two" />
            <div className="hero-panel__poster">{heroMovie ? <MovieArt movie={heroMovie} /> : <div className="movie-art movie-art--placeholder" aria-hidden="true" />}</div>
            <div className="hero-panel__sticker"><span>TONIGHT</span><b>✳</b><small>looks good</small></div>
            <div className="hero-panel__caption"><span className="hero-panel__live"><i /> ROOM IS OPEN</span><span>3 friends are finding a film</span></div>
            <div className="hero-panel__grain" />
          </div>
        </section>

        <section className="join-strip" aria-label="Join an existing room">
          <div className="join-strip__intro"><span className="join-icon"><Users size={17} /></span><div><strong>Already got an invite?</strong><small>Drop in with a room code.</small></div></div>
          <form onSubmit={joinRoom} className="join-form"><input aria-label="Your display name" id="display-name" value={name} onChange={event => setName(event.target.value)} maxLength={32} placeholder="Your name" /><span className="join-form__divider" /><input aria-label="Six-character room code" value={code} onChange={event => setCode(event.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase())} placeholder="ROOM CODE" maxLength={6} /><button className="button button--light" type="submit">Join room <ArrowRight size={15} /></button></form>
          <span className="join-strip__note"><span className="status-dot" /> Private by invite</span>
        </section>

        <section className="discovery-section" id="discover">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow__dash" /> THE GOOD STUFF</div><h2>Find your <em>next favorite.</em></h2><p>Browse Bollywood and Hollywood by genre. Verified full-film links are highlighted; for other titles, the host can add a YouTube or direct video URL.</p></div><span className="catalog-count"><Film size={14} /> {results.length} films in the reel</span></div>
          <DiscoveryFilters movies={movies} query={query} setQuery={setQuery} industry={industry} setIndustry={setIndustry} genre={genre} setGenre={setGenre} mood={mood} setMood={setMood} underThreeHours={underThreeHours} setUnderThreeHours={setUnderThreeHours} />
          {catalogQuery.isLoading && <div className="catalog-state">Loading the movie collection…</div>}
          {catalogQuery.error && <div className="catalog-state catalog-state--error">The movie collection is unavailable right now. <button onClick={() => void catalogQuery.refetch()}>Try again</button></div>}
          {featured.length > 0 && <div className="shelf-heading"><span><Sparkles size={15} /> {query || industry !== "All industries" || genre !== "All genres" ? "MATCHES FOR TONIGHT" : "START HERE"}</span><span className="shelf-heading__line" /></div>}
          {featured.length > 0 && <div className="featured-shelf">{featured.map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} onStart={() => void startRoom(movie)} />)}</div>}
          {rest.length > 0 && <div className="shelf-heading shelf-heading--spaced"><span>{query ? <><Search size={15} /> SEARCH RESULTS</> : <>A LITTLE MORE TO LOVE</>}</span><span className="shelf-heading__line" /></div>}
          <div className="movie-grid">{rest.map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} onStart={() => void startRoom(movie)} />)}</div>
          {results.length === 0 && !catalogQuery.isLoading && !catalogQuery.error && <div className="empty-state"><span>◌</span><h3>No films in this frame.</h3><p>Try a different title, industry, genre, or mood.</p><button className="button button--quiet" onClick={() => { setQuery(""); setIndustry("All industries"); setGenre("All genres"); setMood("Any mood"); setUnderThreeHours(false); }}>Clear filters <X size={14} /></button></div>}
        </section>

        <section className="how-section" id="how-it-works"><div className="how-section__stamp">RR<br />✳</div><div><div className="eyebrow"><span className="eyebrow__dash" /> LESS COORDINATION, MORE CINEMA</div><h2>It takes three little things.</h2></div><div className="how-steps"><div><span>01</span><strong>Make a room</strong><small>One link is all your friends need.</small></div><div><span>02</span><strong>Pick the picture</strong><small>Add films to the shared queue or start now.</small></div><div><span>03</span><strong>Roll together</strong><small>Playback syncs. The reactions are all yours.</small></div></div></section>
      </main>
      <footer className="footer"><Brand /><span>Made for the people you'd save a seat for.</span><span>REELROOM · {new Date().getFullYear()}</span></footer>
    </div>
  );
}

function MovieCard({ movie, index, onStart }: { movie: Movie; index: number; onStart: () => void }) {
  const playableLabel = movie.playbackSourceType === "public-domain"
    ? "Public-domain source · U.S."
    : movie.playbackSourceType === "official"
      ? "Official source · region/embed may vary"
      : movie.playbackSourceUrl
        ? "Source page · in-room playback unverified"
        : movie.videoUrl
          ? "Video link available"
          : "Needs a host video link";

  return (
    <article className="movie-card" style={{ animationDelay: `${index * 35}ms` }}>
      <button className="movie-card__cover" onClick={onStart} aria-label={`Start a watch room for ${movie.title}`}>
        <MovieArt movie={movie} />
        <span className="cover-play"><span>▶</span></span>
      </button>
      <div className="movie-card__meta">
        <div className="movie-card__title-row">
          <h3>{movie.title}</h3>
          <span className={`movie-rating movie-rating--${movie.industry.toLowerCase()}`}>{movie.industry}</span>
        </div>
        <div className="movie-card__details">{movie.year}<i />{movie.runtime} min</div>
        <div className="movie-card__genres" aria-label={`Genres: ${movie.genres.join(", ")}`}>
          {movie.genres.map(movieGenre => <span key={movieGenre}>{movieGenre}</span>)}
        </div>
        <div className="movie-card__source-row">
          <span className={`movie-card__play-source${movie.videoUrl ? "" : " movie-card__play-source--manual"}`} title={movie.playbackRightsNote ?? undefined}>{playableLabel}</span>
          {movie.playbackSourceUrl && <a href={movie.playbackSourceUrl} target="_blank" rel="noopener noreferrer">Source &amp; rights</a>}
        </div>
        <p>{movie.synopsis}</p>
        <button className="movie-card__cta" onClick={onStart}>{movie.videoUrl ? "Watch together" : "Room · add video link"} <ArrowRight size={14} /></button>
      </div>
    </article>
  );
}
