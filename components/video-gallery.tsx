"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";
import { videoContent as copy, type StoreVideo } from "@/content/videos";

const controlClass =
  "flex size-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-brand-deep focus-visible:outline-primary disabled:opacity-30";

function VideoCard({
  video,
  onPlay,
}: {
  video: StoreVideo;
  onPlay: (element: HTMLVideoElement) => void;
}) {
  const player = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = player.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) element.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    const pauseHidden = () => {
      if (document.hidden) element.pause();
    };
    document.addEventListener("visibilitychange", pauseHidden);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseHidden);
      element.pause();
    };
  }, []);

  async function toggle() {
    const element = player.current;
    if (!element) return;
    if (!element.paused) {
      element.pause();
      return;
    }
    setFailed(false);
    try {
      await element.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFailed(true);
    }
  }

  return (
    <article
      className="group border-brand-deep/10 w-[80%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white shadow-sm sm:w-[calc((100%_-_1.25rem)/2)] lg:w-[calc((100%_-_3.75rem)/4)]"
      aria-label={video.title}
    >
      <div className="bg-foreground relative aspect-[9/16] overflow-hidden">
        <video
          ref={player}
          src={video.src}
          poster={video.poster}
          preload="none"
          playsInline
          muted={muted}
          aria-label={video.title}
          className="h-full w-full object-contain"
          onPlay={(event) => {
            setPlaying(true);
            setFailed(false);
            onPlay(event.currentTarget);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            type="button"
            className={controlClass}
            aria-label={(muted ? copy.unmute : copy.mute) + " — " + video.title}
            aria-pressed={!muted}
            onClick={() => {
              if (player.current) player.current.muted = !player.current.muted;
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            className={controlClass}
            aria-label={
              (playing ? copy.pause : copy.play) + " — " + video.title
            }
            onClick={toggle}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
        {!playing && !failed && (
          <button
            type="button"
            onClick={toggle}
            aria-label={copy.play + " — " + video.title}
            className="text-brand-deep hover:bg-primary absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 shadow-lg backdrop-blur-sm transition-colors"
          >
            <Play size={26} fill="currentColor" />
          </button>
        )}
        {failed && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl bg-black/80 p-4 text-center text-sm text-white">
            <p role="status">{copy.playbackError}</p>
            <button
              type="button"
              className="bg-primary text-foreground mx-auto mt-3 flex min-h-11 items-center gap-2 rounded-full px-4"
              onClick={() => {
                const element = player.current;
                if (!element) return;
                if (video.fallbackSrc) element.src = video.fallbackSrc;
                element.load();
                void toggle();
              }}
            >
              <RotateCcw size={16} />
              {copy.retry}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function VideoGallery({
  initialVideos,
}: {
  initialVideos: StoreVideo[] | null;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [videos, setVideos] = useState<StoreVideo[]>(initialVideos ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialVideos === null);
  const [attempt, setAttempt] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    if (attempt === 0) return;
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(20_000),
    ]);
    fetch("/api/videos", { signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        return response.json() as Promise<{ videos: StoreVideo[] }>;
      })
      .then((data) => {
        setVideos(data.videos);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [attempt]);

  const updateEdges = useCallback(() => {
    const element = rail.current;
    if (element)
      setEdges({
        start: element.scrollLeft <= 4,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 4,
      });
  }, []);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    updateEdges();
    return () => observer.disconnect();
  }, [videos, updateEdges]);

  function move(direction: number) {
    const element = rail.current;
    const card = element?.firstElementChild;
    if (!element || !card) return;
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + 20),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function playOnly(selected: HTMLVideoElement) {
    rail.current?.querySelectorAll("video").forEach((video) => {
      if (video !== selected) video.pause();
    });
  }

  if (!loading && !error && !videos.length) return null;

  return (
    <section
      className="border-brand-deep/10 bg-secondary border-y py-14 sm:py-20"
      aria-labelledby="video-title"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-brand-deep mb-3 text-xs font-semibold tracking-[0.18em] uppercase">
              {copy.eyebrow}
            </p>
            <h2
              id="video-title"
              className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl"
            >
              {copy.title}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
              {copy.description}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={copy.previous}
              aria-controls="video-carousel"
              disabled={loading || error || edges.start}
              onClick={() => move(-1)}
              className="border-brand-deep/20 text-brand-deep hover:bg-primary flex size-11 items-center justify-center rounded-full border bg-white transition-colors disabled:opacity-35"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              aria-label={copy.next}
              aria-controls="video-carousel"
              disabled={loading || error || edges.end}
              onClick={() => move(1)}
              className="border-brand-deep/20 text-brand-deep hover:bg-primary flex size-11 items-center justify-center rounded-full border bg-white transition-colors disabled:opacity-35"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        {loading ? (
          <p role="status" className="text-muted-foreground py-4 text-sm">
            {copy.loading}
          </p>
        ) : error ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <p role="status">{copy.unavailable}</p>
            <button
              className="bg-primary mt-4 min-h-11 rounded-full px-6 text-sm font-semibold"
              onClick={() => {
                setLoading(true);
                setError(false);
                setAttempt((value) => value + 1);
              }}
            >
              {copy.retry}
            </button>
          </div>
        ) : (
          <div
            id="video-carousel"
            ref={rail}
            role="region"
            aria-roledescription="carousel"
            aria-label={copy.title}
            tabIndex={0}
            onScroll={updateEdges}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                move(event.key === "ArrowLeft" ? -1 : 1);
              }
            }}
            className="flex snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:var(--primary)_transparent] gap-5 overflow-x-auto overscroll-x-contain pb-4"
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={playOnly} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
