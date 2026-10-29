"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { logger } from "@/lib/logger";

// Catches unexpected errors (SQLite failures, bugs) thrown while rendering a route.
// Expected errors are returned from Server Actions and never reach this boundary (ADR 005).
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // The digest matches the reference shown below and the full error in the server logs.
    logger.error("Unexpected error", { digest: error.digest }, error);
  }, [error]);

  // Refresh first so Server Components re-run their queries, then re-render the segment.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-black/10 p-6 dark:border-white/15">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p>We couldn&apos;t load this page. Your progress is safe. Try again in a moment.</p>
      {error.digest && <p className="text-sm opacity-60">Error reference: {error.digest}</p>}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={retry}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-80 dark:bg-white dark:text-black"
        >
          Try again
        </button>
        <Link href="/journey" className="text-sm opacity-70 hover:opacity-100">
          Back to the journey
        </Link>
      </div>
    </div>
  );
}
