"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value }: { value: string }) {
  const element = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState<number | null>(null);
  const match = value.match(/\d+/);
  const target = match ? Number(match[0]) : null;

  useEffect(() => {
    const node = element.current;
    if (
      !node ||
      target === null ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / 1500, 1);
          setCount(1 + Math.floor((target - 1) * progress));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  const display =
    count === null
      ? value
      : value.replace(
          /\d+/,
          String(count).padStart(
            match?.[0].startsWith("0") ? match[0].length : 1,
            "0",
          ),
        );
  return (
    <span ref={element} className="tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
