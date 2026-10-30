// Pure attempt rules (PRD F2). No database or Next imports, so these are easy to unit test.
import type { ChallengeStatus } from "@/lib/types";

export type AttemptField =
  | "bakedOn"
  | "notes"
  | "rating"
  | "tasteRating"
  | "textureRating"
  | "appearanceRating";

/** Form values as submitted: every field is a string, and missing ones are undefined. */
export type RawAttemptInput = Partial<Record<AttemptField, string>>;

export interface AttemptInput {
  /** ISO date (YYYY-MM-DD). */
  bakedOn: string;
  notes: string | null;
  rating: number;
  tasteRating: number | null;
  textureRating: number | null;
  appearanceRating: number | null;
}

export type AttemptValidation =
  | { ok: true; value: AttemptInput }
  | { ok: false; fieldErrors: Partial<Record<AttemptField, string>> };

const RATING_PATTERN = /^[1-5]$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  // Round-trip through a UTC date so 2026-02-30 is rejected instead of rolling over to March.
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function validateAttempt(raw: RawAttemptInput): AttemptValidation {
  const fieldErrors: Partial<Record<AttemptField, string>> = {};

  const bakedOn = (raw.bakedOn ?? "").trim();
  if (!isRealDate(bakedOn)) fieldErrors.bakedOn = "Enter a valid date.";

  const rating = (raw.rating ?? "").trim();
  if (!RATING_PATTERN.test(rating)) fieldErrors.rating = "Choose an overall rating from 1 to 5.";

  const subRatings = {
    tasteRating: { label: "Taste", raw: raw.tasteRating },
    textureRating: { label: "Texture", raw: raw.textureRating },
    appearanceRating: { label: "Appearance", raw: raw.appearanceRating },
  } as const;
  const parsedSubRatings: Record<keyof typeof subRatings, number | null> = {
    tasteRating: null,
    textureRating: null,
    appearanceRating: null,
  };
  for (const [field, { label, raw: value }] of Object.entries(subRatings) as [
    keyof typeof subRatings,
    (typeof subRatings)[keyof typeof subRatings],
  ][]) {
    const trimmed = (value ?? "").trim();
    if (trimmed === "") continue;
    if (RATING_PATTERN.test(trimmed)) parsedSubRatings[field] = Number(trimmed);
    else fieldErrors[field] = `${label} rating must be from 1 to 5.`;
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      bakedOn,
      notes: (raw.notes ?? "").trim() || null,
      rating: Number(rating),
      ...parsedSubRatings,
    },
  };
}

/** Local calendar date as YYYY-MM-DD. Not toISOString(), which is UTC and can show tomorrow or yesterday. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Only locked challenges refuse attempts. Mastered ones still accept them. */
export function canLogAttempt(status: ChallengeStatus): boolean {
  return status !== "locked";
}
