import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { getDb } from "@/lib/db/client";
import { listJourney } from "@/lib/db/queries";
import { LEVEL_LABELS } from "@/lib/domain/journey";
import { LEVELS } from "@/lib/types";

// F1: The ordered challenge list, grouped by level.
export default function JourneyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">The journey</h1>
      <Suspense fallback={<p className="opacity-60">Loading journey…</p>}>
        <ChallengeList />
      </Suspense>
    </div>
  );
}

async function ChallengeList() {
  await connection();
  const journey = listJourney(getDb());

  return LEVELS.map((level) => {
    const items = journey.filter((item) => item.challenge.level === level);
    if (items.length === 0) return null;

    return (
      <section key={level} className="space-y-2">
        <h2 className="text-lg font-medium">{LEVEL_LABELS[level]}</h2>
        <ol className="space-y-2">
          {items.map(({ challenge, status }) => {
            const content = (
              <>
                <span className="w-6 text-sm text-black/60 dark:text-white/60">{challenge.position}</span>
                <span className="flex-1">
                  {/* Locked rows mute only the title, so the row stays readable (WCAG contrast). */}
                  <span
                    className={`block font-medium ${status === "locked" ? "text-black/60 dark:text-white/60" : ""}`}
                  >
                    {challenge.title}
                  </span>
                  <span className="block text-sm opacity-70">{challenge.technique}</span>
                </span>
                <StatusBadge status={status} />
              </>
            );
            const className =
              "flex items-center gap-3 rounded-lg border border-black/10 p-3 dark:border-white/15";

            return (
              <li key={challenge.id}>
                {status === "locked" ? (
                  <div className={className} aria-disabled="true">
                    {content}
                  </div>
                ) : (
                  <Link
                    href={`/challenges/${challenge.slug}`}
                    className={`${className} hover:bg-black/5 dark:hover:bg-white/5`}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    );
  });
}
