import { cn } from "@/lib/utils";

export function StorePage({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <main
      id="main"
      className={cn(
        "mx-auto min-h-[55vh] max-w-6xl px-5 pb-10 sm:px-8 lg:pb-16",
        compact ? "pt-3 sm:pt-4" : "pt-10 lg:pt-16",
      )}
    >
      <h1
        className={cn(
          "text-3xl font-semibold tracking-tight sm:text-4xl",
          compact ? "mb-3" : "mb-8",
        )}
      >
        {title}
      </h1>
      {children}
    </main>
  );
}
