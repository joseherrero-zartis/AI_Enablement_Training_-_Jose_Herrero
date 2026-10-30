import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { getDb } from "@/lib/db/client";
import { getChallengeBySlug } from "@/lib/db/queries";
import { LEVEL_LABELS, meetsMasteryHint } from "@/lib/domain/journey";

// F2–F4: Challenge detail with attempts, recipe changes and mastery.
export default function ChallengePage({ params }: PageProps<"/challenges/[slug]">) {
  return (
    <div className="space-y-6">
      <Link href="/journey" className="text-sm opacity-70 hover:opacity-100">
        ← Back to the journey
      </Link>
      <Suspense fallback={<p className="opacity-60">Loading challenge…</p>}>
        {params.then(({ slug }) => (
          <ChallengeDetail slug={slug} />
        ))}
      </Suspense>
    </div>
  );
}

async function ChallengeDetail({ slug }: { slug: string }) {
  await connection();
  const detail = getChallengeBySlug(getDb(), slug);
  if (!detail) notFound();

  const { challenge, status, progress, attempts } = detail;

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm opacity-70">
          {LEVEL_LABELS[challenge.level]} · {challenge.technique}
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{challenge.title}</h1>
          <StatusBadge status={status} />
        </div>
        <p>{challenge.description}</p>
      </header>

      {status === "locked" ? (
        <p className="rounded-lg border border-black/10 p-4 dark:border-white/15">
          Master the previous challenge to unlock this one.
        </p>
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-lg font-medium">Base recipe</h2>
            {challenge.recipe ? (
              <pre className="whitespace-pre-wrap font-sans">{challenge.recipe}</pre>
            ) : (
              <p className="opacity-60">No base recipe written yet.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Mastery</h2>
            {status === "mastered" ? (
              <p>
                Mastered on {progress.masteredAt?.slice(0, 10)}.
                {progress.masteryNote && <> “{progress.masteryNote}”</>}
              </p>
            ) : (
              <p className="opacity-80">
                {meetsMasteryHint(attempts.map((a) => a.rating))
                  ? "You have 3 attempts rated 4+. Ready to call it mastered?"
                  : "Not mastered yet."}
              </p>
            )}
            {/* TODO(F4): mark as mastered / undo, with an optional reflection note. */}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Attempts</h2>
            {/* TODO(F2, F3): form to log an attempt with notes, ratings and recipe changes. */}
            {attempts.length === 0 ? (
              <p className="opacity-60">No attempts logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {attempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="rounded-lg border border-black/10 p-4 dark:border-white/15"
                  >
                    <p className="font-medium">
                      {attempt.bakedOn} · {attempt.rating}/5
                    </p>
                    {attempt.notes && <p className="mt-1 whitespace-pre-wrap">{attempt.notes}</p>}
                    {attempt.changes.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {attempt.changes.map((change) => (
                          <li key={change.id}>
                            {change.description}
                            {change.outcome && <span className="opacity-70"> → {change.outcome}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </article>
  );
}
