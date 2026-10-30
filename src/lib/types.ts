export const LEVELS = ["beginner", "intermediate", "advanced", "master"] as const;
export type Level = (typeof LEVELS)[number];

export type ChallengeStatus = "locked" | "not_started" | "in_progress" | "mastered";

/** A step in the journey. Seeded data, never edited by the user in v1. */
export interface Challenge {
  id: number;
  slug: string;
  /** 1-based order in the journey. Unlocking follows this order. */
  position: number;
  title: string;
  technique: string;
  level: Level;
  description: string;
  /** Base recipe (ingredients + steps) as plain text. */
  recipe: string | null;
}

/** The user's state for one challenge. */
export interface ChallengeProgress {
  challengeId: number;
  unlockedAt: string | null;
  masteredAt: string | null;
  masteryNote: string | null;
  attemptCount: number;
}

export interface RecipeChange {
  id: number;
  attemptId: number;
  description: string;
  outcome: string | null;
}

export interface Attempt {
  id: number;
  challengeId: number;
  /** ISO date (YYYY-MM-DD) of the bake. */
  bakedOn: string;
  notes: string | null;
  /** Overall result, 1–5. */
  rating: number;
  tasteRating: number | null;
  textureRating: number | null;
  appearanceRating: number | null;
  createdAt: string;
  changes: RecipeChange[];
}

export interface JourneyItem {
  challenge: Challenge;
  status: ChallengeStatus;
}

/** What a Server Action returns for expected errors. Nothing is thrown for these (ADR 005). */
export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Submitted form values, so the form can show them again after an error. */
  values?: Record<string, string>;
}
