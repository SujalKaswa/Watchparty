import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type PlayerStateEvent = { data: number };
type PlayerErrorEvent = { data: number };
type YouTubePlayerApi = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  unMute(): void;
  destroy(): void;
};
type YouTubeApi = {
  Player: new (element: HTMLElement, options: {
    height: string;
    width: string;
    videoId: string;
    host: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: { target: YouTubePlayerApi }) => void;
      onStateChange: (event: PlayerStateEvent) => void;
      onError: (event: PlayerErrorEvent) => void;
    };
  }) => YouTubePlayerApi;
};
type YouTubeWindow = Window & {
  YT?: YouTubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

export type YouTubePlayerHandle = {
  play(): void;
  pause(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
};

type Props = {
  videoId: string;
  playing: boolean;
  onReady?: () => void;
};

let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    let settled = false;
    let timeout = 0;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (error) {
        apiPromise = null;
        reject(error);
      } else if (youtubeWindow.YT?.Player) resolve(youtubeWindow.YT);
      else {
        apiPromise = null;
        reject(new Error("YouTube's player API did not become available."));
      }
    };

    const previousCallback = youtubeWindow.onYouTubeIframeAPIReady;
    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      finish();
    };

    timeout = window.setTimeout(() => finish(new Error("YouTube took too long to load. Check the connection or choose another video link.")), 18_000);
    let script = document.querySelector<HTMLScriptElement>("script[data-reelroom-youtube-api]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.reelroomYoutubeApi = "true";
      script.onerror = () => finish(new Error("YouTube couldn't load in this browser. Choose another video link."));
      document.head.appendChild(script);
    }
  });
  return apiPromise;
}

const EMBED_ERROR = "YouTube couldn't play this video here. It may block embedding, require sign-in, or be unavailable in your region. Ask the host to try another link.";

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(function YouTubePlayer({ videoId, playing, onReady }, forwardedRef) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerApi | null>(null);
  const onReadyRef = useRef(onReady);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [needsGesture, setNeedsGesture] = useState(false);

  useImperativeHandle(forwardedRef, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seekTo: (seconds, allowSeekAhead = true) => playerRef.current?.seekTo(seconds, allowSeekAhead),
    getCurrentTime: () => playerRef.current?.getCurrentTime() ?? Number.NaN,
    getDuration: () => playerRef.current?.getDuration() ?? Number.NaN,
    getPlayerState: () => playerRef.current?.getPlayerState() ?? -1,
  }), []);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  useEffect(() => {
    let active = true;
    let player: YouTubePlayerApi | null = null;
    setReady(false);
    setError("");
    setNeedsGesture(false);

    void loadYouTubeApi().then(api => {
      if (!active || !containerRef.current) return;
      player = new api.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 1,
          modestbranding: 1,
          origin: window.location.origin,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (!active) return;
            playerRef.current = player;
            setReady(true);
            onReadyRef.current?.();
          },
          onStateChange: event => {
            if (event.data === 1) {
              setNeedsGesture(false);
              setError("");
            }
          },
          onError: () => {
            setNeedsGesture(false);
            setError(EMBED_ERROR);
          },
        },
      });
      playerRef.current = player;
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : "YouTube couldn't load.");
    });

    return () => {
      active = false;
      setReady(false);
      if (playerRef.current === player) playerRef.current = null;
      try { player?.destroy(); } catch { /* ignore teardown races while the API is still loading */ }
    };
  }, [videoId]);

  useEffect(() => {
    if (!ready || !playing) return;
    const timer = window.setTimeout(() => {
      if (playerRef.current && playerRef.current.getPlayerState() !== 1) setNeedsGesture(true);
    }, 2_000);
    return () => window.clearTimeout(timer);
  }, [ready, playing, videoId]);

  const enablePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    try { player.unMute(); } catch { /* iframe may still be initializing */ }
    player.playVideo();
    setNeedsGesture(false);
  };

  return (
    <div className="youtube-player">
      <div className="youtube-player__frame" ref={containerRef} />
      {!ready && !error && <div className="youtube-player__status">Connecting to YouTube…</div>}
      {error && <div className="youtube-player__status youtube-player__status--error" role="status">{error}</div>}
      {needsGesture && !error && <button type="button" className="youtube-player__enable" onClick={enablePlayback}>Tap to enable synchronized playback</button>}
    </div>
  );
});
