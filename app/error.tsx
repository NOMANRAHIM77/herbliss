"use client";

import { Button } from "@/components/ui/button";
import { homeContent } from "@/content/site";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-5 px-6"
    >
      <h1 className="text-4xl font-medium tracking-tight">
        {homeContent.errorTitle}
      </h1>
      <p className="text-muted-foreground">{homeContent.errorDescription}</p>
      <Button onClick={reset}>{homeContent.retryLabel}</Button>
    </main>
  );
}
