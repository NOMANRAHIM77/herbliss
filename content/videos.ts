import { site } from "@/content/site";

export type StoreVideo = {
  id: string;
  title: string;
  src: string;
  fallbackSrc?: string;
  poster: string;
};

export const videoContent = {
  eyebrow: "Watch & discover",
  title: site.name + ", in motion",
  description: "A closer look at our hair and skin care. Tap a video to watch.",
  previous: "Previous videos",
  next: "Next videos",
  loading: "Loading videos…",
  unavailable: "Videos are temporarily unavailable.",
  retry: "Try again",
  play: "Play",
  pause: "Pause",
  mute: "Mute",
  unmute: "Turn sound on",
  playbackError: "This video could not load.",
};
