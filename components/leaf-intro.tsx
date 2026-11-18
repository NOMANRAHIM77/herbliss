"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

/** A short brand introduction, not a network download percentage. */
export function LeafIntro() {
  const [progress, setProgress] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (now: number) => {
      const amount = reduced ? 1 : Math.min((now - start) / 1600, 1);
      setProgress(1 + Math.floor(amount * 99));
      if (amount < 1) frame = requestAnimationFrame(tick);
      else timer = setTimeout(() => setFinished(true), reduced ? 0 : 400);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);

  if (finished) return null;
  return (
    <div
      className={`leaf-intro pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f4faf0] text-[#123c2a] transition-opacity duration-300 ${progress === 100 ? "opacity-0" : "opacity-100"}`}
      aria-hidden="true"
    >
      <div className="absolute size-80 rounded-full bg-[#cce8bb]/50 blur-3xl" />
      <div className="relative mb-8 flex size-36 items-center justify-center">
        <span className="intro-orbit absolute inset-0 rounded-full border border-[#1f7a1f]/15 border-t-[#1f7a1f]/60" />
        <span className="absolute inset-3 rounded-full border border-[#1f7a1f]/10" />
        <Leaf
          className="intro-leaf size-20 fill-[#1f7a1f]/15 text-[#1f7a1f]"
          strokeWidth={1.2}
        />
      </div>
      <p className="relative text-3xl font-semibold tracking-tight">
        The Herbliss
      </p>
      <p className="relative mt-3 text-[10px] font-medium tracking-[0.3em] uppercase">
        A little care. Every day.
      </p>
      <div className="relative mt-9 h-1 w-44 overflow-hidden rounded-full bg-[#1f7a1f]/10">
        <div
          className="h-full rounded-full bg-[#1f7a1f]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="relative mt-3 text-xs tracking-widest tabular-nums">
        Loading · {progress}%
      </p>
    </div>
  );
}
