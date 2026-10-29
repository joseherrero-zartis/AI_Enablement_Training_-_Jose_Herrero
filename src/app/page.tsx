import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDb } from "@/lib/db/client";
import { listJourney } from "@/lib/db/queries";
import { LEVEL_LABELS, summarizeProgress } from "@/lib/domain/journey";

// F5: Progress overview.
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your progress</h1>
      <Suspense fallback={<p className="opacity-60">Loading progress…</p>}>
        <ProgressSummary />
      </Suspense>
    </div>
  );
}

async function ProgressSummary() {
  // SQLite reads are synchronous; without this they would be frozen into the build-time prerender.
  await connection();
  const summary = summarizeProgress(listJourney(getDb()));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-black/10 p-4 dark:border-white/15">
        <p className="text-3xl font-semibold">
          {summary.mastered} / {summary.total} mastered
        </p>
        <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/15">
          <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${summary.percent}%` }} />
        </div>
        <p className="mt-3 text-sm opacity-80">
          Current level: <strong>{LEVEL_LABELS[summary.currentLevel]}</strong>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Next challenge</h2>
        {summary.complete ? (
          <p>You&apos;ve mastered the whole journey. 🎉</p>
        ) : (
          summary.nextChallenge && (
            <Link
              href={`/challenges/${summary.nextChallenge.slug}`}
              className="block rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
            >
              <p className="font-medium">{summary.nextChallenge.title}</p>
              <p className="text-sm opacity-70">{summary.nextChallenge.technique}</p>
            </Link>
          )
        )}
      </section>
    </div>
  );
}
