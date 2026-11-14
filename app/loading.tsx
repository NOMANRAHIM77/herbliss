import { homeContent } from "@/content/site";

export default function Loading() {
  return (
    <main
      id="main"
      role="status"
      aria-label={homeContent.loadingLabel}
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8"
    >
      <div className="bg-muted h-12 w-44 rounded-xl" />
      <div className="bg-secondary mt-8 h-[32rem] animate-pulse rounded-3xl motion-reduce:animate-none" />
      <span className="sr-only">{homeContent.loadingLabel}</span>
    </main>
  );
}
