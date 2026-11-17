import { homeContent, site, socialPlatforms } from "@/content/site";

export function SocialIcons({ inverse = false }: { inverse?: boolean }) {
  return (
    <div
      className={
        inverse
          ? "text-primary flex shrink-0 items-center"
          : "text-foreground flex shrink-0 items-center"
      }
      role="group"
      aria-label={homeContent.socialLabel}
    >
      {socialPlatforms.map(({ id, label }) => (
        <a
          key={id}
          href={site.social[id]}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-primary-hover hover:text-foreground focus-visible:bg-primary-hover focus-visible:text-foreground flex size-11 items-center justify-center rounded-lg transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-6"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle
              cx="12"
              cy="12"
              r="3.6"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="17.1" cy="6.9" r="1" fill="currentColor" />
          </svg>
        </a>
      ))}
    </div>
  );
}
