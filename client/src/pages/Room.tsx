import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Clapperboard, Copy, Crown, Film, Link2, ListPlus, MessageCircle, MoreHorizontal, Pause, Play, Plus, Radio, Send, Settings2, Smile, Sparkles, Users, Wifi, WifiOff, X } from "lucide-react";
import { toast } from "sonner";
import type { Movie } from "@shared/catalog";
import type { RoomSnapshot } from "@shared/realtime";
import { planDriftCorrection, estimatePositionMs } from "@shared/sync";
import { AvatarStack, Brand, formatTime, LiveStatus } from "@/components/Brand";
import { MovieArt } from "@/components/MovieArt";
import { getDisplayName, saveDisplayName } from "@/lib/identity";
import { getSeekRange } from "@/lib/seek-range";
import { YouTubePlayer, type YouTubePlayerHandle } from "@/components/YouTubePlayer";
import { EMOJI_REACTIONS, useWatchRoom } from "@/lib/realtime";
import { trpc } from "@/lib/trpc";
import { getYouTubeVideoId, normalizePlayableUrl, YOUTUBE_SAMPLE_URL } from "@shared/video";

const roomTabs = ["Chat", "Queue", "Poll", "People"] as const;
type RoomTab = typeof roomTabs[number];

export default function Room({ code }: { code: string }) {
  const [, setLocation] = useLocation();
  const room = useWatchRoom(code);
  const catalogQuery = trpc.catalog.list.useQuery();
  const movies = catalogQuery.data ?? [];
  const snapshot = room.snapshot;
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<YouTubePlayerHandle>(null);
  const syncingRef = useRef(false);
  const [tab, setTab] = useState<RoomTab>("Chat");
  const [chat, setChat] = useState("");
  const [question, setQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState("Yes, Not tonight");
  const [myVote, setMyVote] = useState<number | null>(null);
  const [videoLink, setVideoLink] = useState(YOUTUBE_SAMPLE_URL);
  const [videoTitle, setVideoTitle] = useState("");
  const [showSource, setShowSource] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [seekDraft, setSeekDraft] = useState<number | null>(null);
  const [actualDuration, setActualDuration] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [drift, setDrift] = useState(0);
  const [nameDraft, setNameDraft] = useState(getDisplayName());
  const [roomMenu, setRoomMenu] = useState(false);
  const [reactionToast, setReactionToast] = useState<{ name: string; emoji: string } | null>(null);
  const lastReactionId = useRef(0);
  const isHost = snapshot?.hostId === room.participantId;
  const playback = snapshot?.playback;
  const currentMovie = useMemo(() => movies.find(movie => movie.id === playback?.movieId) ?? null, [movies, playback?.movieId]);
  const artworkMovie = currentMovie ?? movies[0] ?? null;
  const youtubeVideoId = playback?.videoUrl ? getYouTubeVideoId(playback.videoUrl) : null;
  const serverNow = Date.now() + room.clockOffsetMs;
  const estimatedMs = playback ? estimatePositionMs(playback, serverNow) : 0;
  const durationMs = actualDuration ? actualDuration * 1_000 : playback?.durationMs ?? 0;
  const seekRange = getSeekRange({ durationMs, videoDurationSeconds: videoRef.current?.duration ?? Number.NaN, currentTimeSeconds: videoRef.current?.currentTime ?? Number.NaN, estimatedPositionMs: estimatedMs, draftSeconds: seekDraft });
  const people = snapshot?.participants ?? [];

  useEffect(() => { setYoutubeReady(false); }, [youtubeVideoId]);
  useEffect(() => { setActualDuration(0); setPlayhead(0); }, [playback?.videoUrl]);

  useEffect(() => {
    if (!snapshot || !isHost || playback?.movieId || typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("film");
    if (requested && movies.some(movie => movie.id === requested)) {
      room.control("select", { movieId: requested });
      window.history.replaceState(null, "", `/r/${snapshot.code}`);
    }
  }, [snapshot, isHost, playback?.movieId, movies]);

  useEffect(() => {
    const video = videoRef.current;
    const youtube = youtubeRef.current;
    if (!playback?.videoUrl) return;
    const expected = estimatePositionMs(playback, serverNow);
    if (video) {
      syncingRef.current = true;
      if (video.readyState >= 1 && Math.abs(video.currentTime * 1_000 - expected) > 500) video.currentTime = expected / 1_000;
      if (playback.playing && video.paused) void video.play().catch(() => { if (!isHost) room.setError("Your browser couldn't start the video. Tap play to allow playback."); });
      else if (!playback.playing && !video.paused) video.pause();
      video.playbackRate = 1;
      const timer = window.setTimeout(() => { syncingRef.current = false; }, 320);
      return () => window.clearTimeout(timer);
    }
    if (!youtube || !youtubeReady) return;
    const playerState = youtube.getPlayerState();
    const currentTime = youtube.getCurrentTime();
    if (playerState >= 0 && Number.isFinite(currentTime) && Math.abs(currentTime * 1_000 - expected) > 500) youtube.seekTo(expected / 1_000, true);
    if (playback.playing && playerState !== 1) youtube.play();
    else if (!playback.playing && playerState === 1) youtube.pause();
  }, [playback?.movieId, playback?.videoUrl, playback?.playing, playback?.positionMs, playback?.serverTimestamp, playback?.revision, isHost, room.clockOffsetMs, youtubeReady]);

  useEffect(() => {
    const video = videoRef.current;
    const youtube = youtubeRef.current;
    if ((!video && (!youtube || !youtubeReady)) || !playback?.playing || isHost) return;
    const timer = window.setInterval(() => {
      const actualTime = video ? video.currentTime * 1_000 : youtube ? youtube.getCurrentTime() * 1_000 : Number.NaN;
      if ((video && video.readyState < 2) || !Number.isFinite(actualTime)) return;
      const correction = planDriftCorrection(playback, actualTime, Date.now() + room.clockOffsetMs);
      setDrift(correction.driftMs);
      if (correction.type === "seek") {
        if (video) {
          syncingRef.current = true;
          video.currentTime = correction.positionMs / 1_000;
          video.playbackRate = 1;
          setTimeout(() => { syncingRef.current = false; }, 220);
        } else youtube?.seekTo(correction.positionMs / 1_000, true);
      } else if (correction.type === "rate" && video) {
        video.playbackRate = correction.playbackRate;
        window.setTimeout(() => { if (video.isConnected) video.playbackRate = 1; }, 1_200);
      } else if (video) {
        video.playbackRate = 1;
      }
    }, 1_200);
    return () => window.clearInterval(timer);
  }, [playback?.playing, playback?.positionMs, playback?.serverTimestamp, playback?.revision, isHost, room.clockOffsetMs, youtubeReady]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (videoRef.current) {
        setPlayhead(videoRef.current.currentTime);
        if (Number.isFinite(videoRef.current.duration)) setActualDuration(videoRef.current.duration);
      } else if (youtubeReady && youtubeRef.current) {
        const time = youtubeRef.current.getCurrentTime();
        const duration = youtubeRef.current.getDuration();
        if (Number.isFinite(time)) setPlayhead(time);
        if (Number.isFinite(duration) && duration > 0) setActualDuration(duration);
      }
    }, 400);
    return () => window.clearInterval(timer);
  }, [youtubeReady]);

  useEffect(() => {
    const latest = room.reactions.at(-1);
    if (!latest || latest.createdAt === lastReactionId.current) return;
    lastReactionId.current = latest.createdAt;
    setReactionToast({ name: latest.name, emoji: latest.emoji });
    const timer = window.setTimeout(() => setReactionToast(null), 2_900);
    return () => window.clearTimeout(timer);
  }, [room.reactions]);

  useEffect(() => { setMyVote(null); }, [snapshot?.poll?.id]);

  const sendChat = (event: FormEvent) => {
    event.preventDefault();
    if (!chat.trim()) return;
    room.sendChat(chat);
    setChat("");
  };

  const addVideoSource = (event: FormEvent) => {
    event.preventDefault();
    if (!videoLink.trim()) return;
    const normalizedUrl = normalizePlayableUrl(videoLink);
    if (!normalizedUrl) {
      toast.error("Use a YouTube watch/short link or a direct HTTPS MP4, WebM, or Ogg URL.");
      return;
    }
    room.control("source", { videoUrl: normalizedUrl, movieTitle: videoTitle.trim() || playback?.movieTitle || "Shared video" });
    setShowSource(false);
    setVideoLink(YOUTUBE_SAMPLE_URL);
  };

  const togglePlayback = () => {
    const nextAction = playback?.playing ? "pause" : "play";
    const video = videoRef.current;
    const youtube = youtubeRef.current;
    if (video) {
      syncingRef.current = true;
      if (nextAction === "play") {
        void video.play().catch(() => room.setError("Your browser couldn't start this video. Try the YouTube play prompt or another source."));
      } else video.pause();
      window.setTimeout(() => { syncingRef.current = false; }, 320);
    } else if (youtube) {
      if (nextAction === "play") youtube.play();
      else youtube.pause();
    }
    room.control(nextAction);
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Invite link copied. Seats available for 49 more.");
    } catch {
      await navigator.clipboard.writeText(snapshot?.code ?? code.toUpperCase()).catch(() => undefined);
      toast.success(`Room code ${snapshot?.code ?? code.toUpperCase()} copied.`);
    }
  };

  const createPoll = (event: FormEvent) => {
    event.preventDefault();
    const options = pollOptions.split(",").map(value => value.trim()).filter(Boolean);
    room.createPoll(question, options);
    setQuestion("");
  };

  const chooseMovie = (movie: Movie) => room.control("select", { movieId: movie.id });

  if (!snapshot) return <div className="room-loading"><Brand /><div className="loading-reel"><span /></div><h1>{room.error ? "We couldn't join this room." : "Finding your seat…"}</h1><p>{room.error || `Joining ${code.toUpperCase()} and syncing the room.`}</p>{room.error && <button className="button button--ember" onClick={() => setLocation("/")}><ArrowLeft size={15} /> Back to discovery</button>}<LiveStatus connected={room.connected} /></div>;

  return (
    <div className="room-page">
      <header className="room-topbar">
        <Brand light />
        <div className="room-topbar__middle"><button className="back-link" onClick={() => setLocation("/")}><ArrowLeft size={14} /> Discover</button><span className="breadcrumb-divider">/</span><span className="room-label">Movie night <small>· {snapshot.code}</small></span></div>
        <div className="room-topbar__actions"><LiveStatus connected={room.connected} latency={room.lastLatencyMs} /><button className="icon-button room-share" onClick={() => void copyInvite()} aria-label="Copy room invite"><Link2 size={15} /><span>Invite</span></button><div className="room-menu-wrap"><button className="icon-button" onClick={() => setRoomMenu(!roomMenu)} aria-label="Room menu"><MoreHorizontal size={19} /></button>{roomMenu && <div className="room-menu"><button onClick={() => { void copyInvite(); setRoomMenu(false); }}><Copy size={14} /> Copy invite link</button><button onClick={() => { navigator.clipboard.writeText(snapshot.code).then(() => toast.success("Room code copied.")); setRoomMenu(false); }}><Clapperboard size={14} /> Copy room code</button></div>}</div></div>
      </header>

      {room.error && <div className="room-error"><WifiOff size={15} /><span>{room.error}</span><button onClick={() => room.setError("")} aria-label="Dismiss message"><X size={14} /></button></div>}
      {!room.connected && <div className="reconnect-banner"><WifiOff size={14} /> The room connection dropped. Rejoining and reconciling the latest playback state…</div>}

      <main className="room-layout">
        <section className="watch-column">
          <div className="watch-heading"><div><div className="eyebrow"><span className="eyebrow__dash" /> THE SCREENING ROOM</div><h1>{playback?.movieTitle || "A room with a view."}</h1><p>{playback?.movieTitle ? `${playback.movieTitle} · ${playback.durationMs ? Math.round(playback.durationMs / 60_000) + " min" : "shared video"}` : "Pick a film or add a YouTube/direct video link."}</p></div><div className="attendees-inline"><AvatarStack names={people.map(person => person.name)} /><span>{people.length} here<span className="attendees-online-dot" /></span></div></div>
          <div className={`theater${playback?.videoUrl ? " theater--playing" : ""}`}>
            <div className="theater__topline"><span><i className="theater-live-dot" /> LIVE ROOM</span><span className="theater__code">#{snapshot.code}</span></div>
            {playback?.videoUrl ? youtubeVideoId ? <YouTubePlayer ref={youtubeRef} key={youtubeVideoId} videoId={youtubeVideoId} playing={playback.playing} onReady={() => setYoutubeReady(true)} /> : <video ref={videoRef} key={playback.videoUrl} className="video-element" src={playback.videoUrl} playsInline preload="metadata" onPlay={() => { if (isHost && !syncingRef.current) room.control("play"); }} onPause={() => { if (isHost && !syncingRef.current) room.control("pause"); }} onLoadedMetadata={() => { if (videoRef.current) { if (Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0) setActualDuration(videoRef.current.duration); if (Number.isFinite(playback.positionMs) && playback.positionMs > 0) videoRef.current.currentTime = estimatePositionMs(playback, serverNow) / 1_000; } }} /> : <div className="theater-empty"><div className="theater-empty__decor">{artworkMovie ? <MovieArt movie={artworkMovie} /> : <div className="movie-art movie-art--placeholder" />}</div><div className="theater-empty__copy"><span className="theater-kicker"><Film size={13} /> THE GOOD PART STARTS HERE</span><h2>{playback?.movieTitle ? "Add the video source." : "The screen is yours."}</h2><p>{playback?.movieTitle ? "Attach a playable YouTube URL or direct MP4, WebM, or Ogg link. Everyone in the room will follow." : "Choose a film below, or paste a YouTube/direct video link for the room."}</p>{isHost && <button className="button button--ember" onClick={() => setShowSource(true)}><Plus size={16} /> Add a video link</button>}{!isHost && <span className="wait-host"><Crown size={14} /> Ask the host to load a film</span>}</div></div>}
            {room.reactions.length > 0 && <div className="reaction-floats" aria-live="polite">{room.reactions.slice(-5).map((reaction, index) => <span key={`${reaction.createdAt}-${index}`} className="reaction-float" style={{ animationDelay: `${index * 75}ms` }}>{reaction.emoji}</span>)}</div>}
            {reactionToast && <div className="reaction-toast"><span>{reactionToast.emoji}</span> {reactionToast.name} is feeling this</div>}
            {showSource && <div className="source-modal"><form className="source-card" onSubmit={addVideoSource}><button type="button" className="modal-close" onClick={() => setShowSource(false)} aria-label="Close"><X size={17} /></button><span className="eyebrow"><span className="eyebrow__dash" /> BRING YOUR OWN VIDEO</span><h2>Load a shared video.</h2><p>Paste a YouTube watch/short link or a direct HTTPS MP4, WebM, or Ogg file you have the right to share. YouTube may require each viewer to tap play.</p><label>What should we call it?<input value={videoTitle} onChange={event => setVideoTitle(event.target.value)} maxLength={120} placeholder="Friday's pick" /></label><label>YouTube or video-file URL<input required type="url" value={videoLink} onChange={event => setVideoLink(event.target.value)} placeholder="https://youtu.be/lo4bA4p3MBQ" /></label><button className="button button--ember" type="submit">Load for everyone <ArrowRight size={15} /></button><small>Only the host can change the shared screen.</small></form></div>}
            <div className="theater__footer"><span className="sync-readout"><span className="sync-pulse" />{drift && Math.abs(drift) > 120 ? `Auto-correcting ${Math.abs(drift)}ms drift` : "SYNC CHECK ON"}</span><span className="room-viewers"><Users size={13} /> {people.length} watching</span></div>
          </div>
          <div className="player-controls">
            <button className="play-button" disabled={!isHost || !playback?.videoUrl} onClick={togglePlayback} aria-label={playback?.playing ? "Pause" : "Play"}>{playback?.playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
            <span className="time-readout">{formatTime(playhead || estimatedMs / 1_000)}</span>
            <input className="timeline" type="range" min={0} max={seekRange.max} value={seekRange.value} onChange={event => { const next = Number(event.target.value); setSeekDraft(next); if (isHost) { if (videoRef.current) videoRef.current.currentTime = next; else youtubeRef.current?.seekTo(next, true); } }} onPointerUp={() => { if (seekDraft !== null) room.control("seek", { positionMs: seekDraft * 1_000 }); setSeekDraft(null); }} onKeyUp={() => { if (seekDraft !== null) room.control("seek", { positionMs: seekDraft * 1_000 }); setSeekDraft(null); }} disabled={!isHost || !playback?.videoUrl || !seekRange.canSeek} aria-label="Seek through video" />
            <span className="time-readout">{formatTime(actualDuration || durationMs / 1_000)}</span>
            <button className="controls-more" onClick={() => setShowSource(true)} title="Change video source" disabled={!isHost}><Settings2 size={16} /></button>
          </div>
          <div className="reaction-row"><span>React</span>{EMOJI_REACTIONS.map(emoji => <button key={emoji} onClick={() => room.react(emoji)} aria-label={`React ${emoji}`} className="reaction-button">{emoji}</button>)}<span className="reaction-row__hint">live with the room</span></div>

          <section className="up-next"><div className="section-mini-heading"><div><span className="eyebrow__dash" /> PICK THE NEXT REEL</div><button onClick={() => setLocation("/#discover")}>Discover films <ArrowRight size={14} /></button></div><div className="up-next-shelf">{movies.filter(movie => movie.id !== playback?.movieId).slice(0, 5).map(movie => <button key={movie.id} className="up-next-card" title="Add to the shared playlist" onClick={() => room.addMovie(movie.id)}><MovieArt movie={movie} compact /><span className="up-next-card__title">{movie.title}</span><small>{movie.year} · {movie.genre}</small><i><Plus size={13} /></i></button>)}</div></section>
        </section>

        <aside className="room-side-panel">
          <div className="side-panel-heading"><div><span className="side-panel-eyebrow"><span className="live-dot" /> TOGETHER, RIGHT NOW</span><h2>{people.length} {people.length === 1 ? "seat" : "seats"} filled</h2></div><button className="icon-button" onClick={() => setTab("People")} aria-label="View people"><Users size={17} /></button></div>
          <div className="attendee-strip">{people.slice(0, 4).map((person, index) => <div className="attendee-pill" key={person.id}><span className={`avatar avatar--small avatar-color-${index % 6}`}>{person.name.slice(0, 1).toUpperCase()}</span><span>{person.name}{person.id === room.participantId ? " (you)" : ""}</span>{person.id === snapshot.hostId && <Crown size={12} className="host-crown" />}</div>)}{people.length > 4 && <button className="attendee-more" onClick={() => setTab("People")}>+{people.length - 4}</button>}</div>
          <div className="room-tabs">{roomTabs.map(item => <button key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item === "Chat" ? <MessageCircle size={14} /> : item === "Queue" ? <ListPlus size={14} /> : item === "Poll" ? <Sparkles size={14} /> : <Users size={14} />}{item}{item === "Chat" && snapshot.messages.length > 0 && <i>{snapshot.messages.length}</i>}</button>)}</div>
          <div className="side-panel-content">
            {tab === "Chat" && <><div className="feed-note"><span>✳</span> Say hello, or save the commentary for the good bits.</div><div className="chat-feed" aria-live="polite">{snapshot.messages.length === 0 && <div className="feed-empty"><span>☁</span><strong>It's quiet in here.</strong><small>Settle in and break the ice.</small></div>}{snapshot.messages.map(message => <div key={message.id} className={`chat-message${message.participantId === room.participantId ? " chat-message--mine" : ""}`}><span className="chat-avatar">{message.name.slice(0, 1).toUpperCase()}</span><div><div className="chat-message__head"><strong>{message.name}</strong><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time></div><p>{message.body}</p></div></div>)}</div><form className="chat-composer" onSubmit={sendChat}><input value={chat} onChange={event => setChat(event.target.value)} maxLength={320} placeholder="Say something kind…" aria-label="Write a chat message" /><button type="submit" disabled={!chat.trim()} aria-label="Send message"><Send size={16} /></button></form></>}

            {tab === "Queue" && <><div className="queue-heading"><span>THE SHARED LIST</span><span>{snapshot.playlist.length} saved</span></div>{snapshot.playlist.length === 0 && <div className="feed-empty"><span>▤</span><strong>No films queued.</strong><small>Everyone can add a pick for later.</small></div>}{snapshot.playlist.map((item, index) => { const movie = movies.find(candidate => candidate.id === item.movieId); return <div className="queue-item" key={item.id}><span className="queue-number">{String(index + 1).padStart(2, "0")}</span>{movie ? <MovieArt movie={movie} compact /> : <div className="movie-art movie-art--compact movie-art--placeholder" />}<div><strong>{item.title}</strong><small>{item.year} · {item.genre}</small></div><button disabled={!isHost} title={isHost ? "Start this film" : "Only the host can start playback"} onClick={() => room.control("select", { movieId: item.movieId })}>{isHost ? <Play size={13} /> : <Crown size={13} />}</button></div>; })}<button className="text-action" onClick={() => setLocation("/#discover")}>Find another film <ArrowRight size={14} /></button></>}

            {tab === "Poll" && <>{snapshot.poll ? <div className="poll-card"><div className="poll-card__top"><span><Sparkles size={14} /> ROOM POLL</span><span className="poll-live">OPEN</span></div><h3>{snapshot.poll.question}</h3><div className="poll-options">{snapshot.poll.options.map((option, index) => { const total = Math.max(1, snapshot.poll!.votes.reduce((sum, count) => sum + count, 0)); const percent = Math.round((snapshot.poll!.votes[index] / total) * 100); return <button key={`${snapshot.poll!.id}-${index}`} className={`poll-option${myVote === index ? " is-voted" : ""}`} onClick={() => { room.vote(snapshot.poll!.id, index); setMyVote(index); }}><span>{option}</span><strong>{percent}%</strong><i style={{ width: `${percent}%` }} /></button>; })}</div><small>{snapshot.poll.votes.reduce((sum, count) => sum + count, 0)} votes · change your vote anytime</small></div> : <div className="feed-empty"><span>✳</span><strong>No open polls.</strong><small>Let the room decide what comes next.</small></div>}<form className="poll-form" onSubmit={createPoll}><label>Ask the room<input value={question} onChange={event => setQuestion(event.target.value)} maxLength={240} placeholder="What are we in the mood for?" required /></label><label>Choices <small>comma-separated</small><input value={pollOptions} onChange={event => setPollOptions(event.target.value)} placeholder="Comedy, Drama" required /></label><button className="button button--ember button--wide" type="submit"><Plus size={15} /> Create a poll</button></form></>}

            {tab === "People" && <><div className="people-list">{people.map((person, index) => <div className="people-row" key={person.id}><span className={`avatar avatar-color-${index % 6}`}>{person.name.slice(0, 1).toUpperCase()}</span><div><strong>{person.name}{person.id === room.participantId ? " (you)" : ""}</strong><small>{person.id === snapshot.hostId ? "Hosting the room" : "Here for the film"}</small></div>{person.id === snapshot.hostId ? <Crown size={15} className="host-crown" /> : isHost && <button onClick={() => room.transferHost(person.id)} title={`Transfer hosting to ${person.name}`} className="make-host"><Crown size={13} /><span>Make host</span></button>}</div>)}</div><div className="name-edit"><label>Your name<input value={nameDraft} maxLength={32} onChange={event => setNameDraft(event.target.value)} /></label><button className="button button--light button--small" onClick={() => { const cleaned = saveDisplayName(nameDraft); room.setDisplayName(cleaned); toast.success("Your room name is saved."); }}><Check size={13} /> Save name</button></div><div className="room-capacity"><Users size={14} /> {people.length} of 50 seats occupied</div></>}
          </div>
          <div className="side-panel-footer"><span>Room code <strong>{snapshot.code}</strong></span><button onClick={() => void copyInvite()}><Copy size={13} /> Share invite</button></div>
        </aside>
      </main>
      <footer className="room-footer"><span><Brand light /></span><span><span className="sync-pulse" /> Sync checks every 1.2 sec</span><span>{isHost ? <><Crown size={13} /> You're hosting</> : "Host controls playback"}</span></footer>
    </div>
  );
}
