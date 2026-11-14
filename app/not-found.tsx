import Link from "next/link";
import { Button } from "@/components/ui/button";
import { homeContent } from "@/content/site";

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-5 px-6"
    >
      <p className="text-brand-deep text-sm">404</p>
      <h1 className="text-4xl font-medium tracking-tight">
        {homeContent.notFoundTitle}
      </h1>
      <p className="text-muted-foreground">{homeContent.notFoundDescription}</p>
      <Button asChild>
        <Link href="/">{homeContent.backToCollection}</Link>
      </Button>
    </main>
  );
}
