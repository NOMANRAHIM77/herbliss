import Image from "next/image";
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
          <Image
            src="/icons/instagram.webp"
            width={28}
            height={28}
            alt=""
            aria-hidden="true"
            unoptimized
            className="size-7"
          />
        </a>
      ))}
    </div>
  );
}
