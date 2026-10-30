import { STATUS_LABELS } from "@/lib/domain/journey";
import type { ChallengeStatus } from "@/lib/types";

const STATUS_STYLES: Record<ChallengeStatus, string> = {
  locked: "bg-black/5 text-black/70 dark:bg-white/10 dark:text-white/70",
  not_started: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  mastered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function StatusBadge({ status }: { status: ChallengeStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {status === "locked" && <span aria-hidden="true">🔒 </span>}
      {STATUS_LABELS[status]}
    </span>
  );
}
