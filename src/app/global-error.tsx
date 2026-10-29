"use client";

import { useEffect } from "react";
import { logger } from "@/utils/logger";
import "./globals.css";

// Catches unexpected errors thrown by the root layout itself. It replaces the layout,
// so it renders its own <html> and <body>. Route errors are handled by error.tsx.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unexpected error in root layout", error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          <div className="space-y-4 rounded-lg border border-black/10 p-6 dark:border-white/15">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p>
              Baker&apos;s Journey couldn&apos;t load. Your progress is safe. Try again in a
              moment.
            </p>
            {error.digest && (
              <p className="text-sm opacity-60">Error reference: {error.digest}</p>
            )}
            {/* A full reload re-runs the root layout, which reset() alone would not. */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-80 dark:bg-white dark:text-black"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
