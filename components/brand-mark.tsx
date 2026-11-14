import { site } from "@/content/site";

export function BrandMark() {
  return (
    <span className="inline-flex items-center gap-3">
      <svg
        width="38"
        height="44"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="text-brand-deep shrink-0"
      >
        <g transform={`rotate(${site.logoRotation} 24 24)`}>
          <path
            d="M24 4C8 14 10 29 21 34C33 38 43 22 24 4Z"
            fill="currentColor"
          />
          <path
            d="M24 14V34M24 23L17 18M24 27L31 21"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M24 33V43"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="text-lg font-semibold tracking-[-0.06em] sm:text-xl">
        {site.name}
      </span>
    </span>
  );
}
