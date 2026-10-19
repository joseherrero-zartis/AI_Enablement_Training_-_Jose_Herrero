// Pure journey rules (PRD F1, F4, F5). No database access here, so these are easy to unit test.
import { LEVELS } from "@/lib/types";
import type {
  Challenge,
  ChallengeProgress,
  ChallengeStatus,
  JourneyItem,
  Level,
} from "@/lib/types";

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  master: "Master",
};

export const STATUS_LABELS: Record<ChallengeStatus, string> = {
  locked: "Locked",
  not_started: "Not started",
  in_progress: "In progress",
  mastered: "Mastered",
};

/** Minimum number of attempts rated 4+ before the UI suggests a challenge may be mastered. */
export const MASTERY_HINT_ATTEMPTS = 3;
export const MASTERY_HINT_MIN_RATING = 4;

/**
 * Status is derived from stored progress. A challenge stays unlocked once unlocked,
 * even if the previous challenge's mastery is undone (PRD F4).
 */
export function getStatus(progress: ChallengeProgress): ChallengeStatus {
  if (progress.masteredAt) return "mastered";
  if (!progress.unlockedAt) return "locked";
  if (progress.attemptCount > 0) return "in_progress";
  return "not_started";
}

/** The challenge that marking `masteredId` as mastered should unlock, or null at the end of the journey. */
export function getChallengeToUnlock(
  challenges: Challenge[],
  masteredId: number,
): Challenge | null {
  const ordered = [...challenges].sort((a, b) => a.position - b.position);
  const index = ordered.findIndex((c) => c.id === masteredId);
  if (index === -1) return null;
  return ordered[index + 1] ?? null;
}

/** Soft guidance only: never blocks the user from marking a challenge as mastered. */
export function meetsMasteryHint(ratings: number[]): boolean {
  return ratings.filter((r) => r >= MASTERY_HINT_MIN_RATING).length >= MASTERY_HINT_ATTEMPTS;
}

export interface ProgressSummary {
  mastered: number;
  total: number;
  /** Level of the next challenge, or the last level once everything is mastered. */
  currentLevel: Level;
  /** First unlocked, not-yet-mastered challenge in journey order. */
  nextChallenge: Challenge | null;
}

export function summarizeProgress(items: JourneyItem[]): ProgressSummary {
  const ordered = [...items].sort((a, b) => a.challenge.position - b.challenge.position);
  const next = ordered.find((i) => i.status === "not_started" || i.status === "in_progress");

  return {
    mastered: ordered.filter((i) => i.status === "mastered").length,
    total: ordered.length,
    currentLevel: next?.challenge.level ?? ordered.at(-1)?.challenge.level ?? LEVELS[0],
    nextChallenge: next?.challenge ?? null,
  };
}
