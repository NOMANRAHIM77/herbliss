import { homeContent, site, socialPlatforms } from "@/content/site";

const iconPaths = {
  facebook: (
    <path
      d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.6v8Z"
      fill="currentColor"
    />
  ),
  instagram: (
    <>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.1" cy="6.9" r="1" fill="currentColor" />
    </>
  ),
  youtube: (
    <>
      <path
        d="M21 7.3a2.8 2.8 0 0 0-2-2C17.2 5 12 5 12 5s-5.2 0-7 .3a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.7 12 29 29 0 0 0 3 16.7a2.8 2.8 0 0 0 2 2c1.8.3 7 .3 7 .3s5.2 0 7-.3a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .3-4.7 29 29 0 0 0-.3-4.7Z"
        fill="currentColor"
      />
      <path d="m10 8.5 6 3.5-6 3.5Z" fill="var(--primary)" />
    </>
  ),
  tiktok: (
    <path
      d="M14 3h3a5.4 5.4 0 0 0 4 4.3v3a8.5 8.5 0 0 1-4-1.4v6.5a6.1 6.1 0 1 1-5-6v3.1a3 3 0 1 0 2 2.9Z"
      fill="currentColor"
    />
  ),
  snapchat: (
    <path
      d="M12 3c-3 0-4.5 2.2-4.5 4.8l.1 2.6c-.5.5-1.4-.6-2-.1-.8.7.3 1.5 1.5 1.8-.4 1.8-2 3.4-4.1 4.1-.5.2-.3.8.2 1 .8.3 1.6.4 2.3.6l.5 1.5c1.2-.3 2.1-.5 3.1.2 1 .7 1.8 1.2 2.9 1.2s1.9-.5 2.9-1.2c1-.7 1.9-.5 3.1-.2l.5-1.5c.7-.2 1.5-.3 2.3-.6.5-.2.7-.8.2-1-2.1-.7-3.7-2.3-4.1-4.1 1.2-.3 2.3-1.1 1.5-1.8-.6-.5-1.5.6-2 .1l.1-2.6C16.5 5.2 15 3 12 3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
};

export function SocialIcons() {
  return (
    <div
      className="text-foreground flex shrink-0 items-center gap-1"
      role="group"
      aria-label={homeContent.socialLabel}
    >
      {socialPlatforms.map(({ id, label }) => {
        const href = site.social[id];
        const icon = (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-4"
            aria-hidden="true"
          >
            {iconPaths[id]}
          </svg>
        );

        return href ? (
          <a
            key={id}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-primary-hover flex size-11 items-center justify-center rounded-full"
          >
            {icon}
          </a>
        ) : (
          <span
            key={id}
            role="img"
            aria-label={`${label} — ${homeContent.socialPending}`}
            title={`${label} — ${homeContent.socialPending}`}
            className="flex h-11 w-6 items-center justify-center"
          >
            {icon}
          </span>
        );
      })}
    </div>
  );
}
