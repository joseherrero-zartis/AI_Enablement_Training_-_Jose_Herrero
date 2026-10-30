// The logic behind the log-attempt Server Action. No Next imports, so it can be tested with an in-memory DB.
import type { Db } from "@/lib/db/client";
import { getChallengeById, insertAttempt } from "@/lib/db/queries";
import { canLogAttempt, validateAttempt } from "@/lib/domain/attempts";
import type { AttemptField, RawAttemptInput } from "@/lib/domain/attempts";
import { changeField, validateRecipeChanges } from "@/lib/domain/recipe-changes";
import type { RawRecipeChange } from "@/lib/domain/recipe-changes";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/lib/types";

const FIELDS: AttemptField[] = [
  "bakedOn",
  "notes",
  "rating",
  "tasteRating",
  "textureRating",
  "appearanceRating",
];

const CHANGE_KEY = /^changes\.(\d+)\.(?:description|outcome)$/;

/** Parse, validate, check the challenge, then write. Expected errors are returned, never thrown. */
export function logAttemptFor(db: Db, challengeId: unknown, formData: FormData): ActionResult {
  const raw: RawAttemptInput = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    raw[field] = typeof value === "string" ? value : "";
  }

  // Rows are named changes.0.description, changes.0.outcome, ... The form sends them without gaps, but
  // every submitted index is read (in order) so a row is never dropped silently. Rows are renumbered by
  // position, and the errors and echoed values use those positions.
  const indexes = new Set<number>();
  for (const key of formData.keys()) {
    const match = CHANGE_KEY.exec(key);
    if (match) indexes.add(Number(match[1]));
  }
  const rows: RawRecipeChange[] = [];
  const changeValues: Record<string, string> = {};
  [...indexes]
    .sort((a, b) => a - b)
    .forEach((submitted, i) => {
      const description = formData.get(changeField(submitted, "description"));
      const outcome = formData.get(changeField(submitted, "outcome"));
      const row = {
        description: typeof description === "string" ? description : "",
        outcome: typeof outcome === "string" ? outcome : "",
      };
      rows.push(row);
      changeValues[changeField(i, "description")] = row.description;
      changeValues[changeField(i, "outcome")] = row.outcome;
    });
  const values = { ...raw, ...changeValues };

  // Run both validators so the baker sees every problem at once.
  const validation = validateAttempt(raw);
  const changes = validateRecipeChanges(rows);
  if (!validation.ok || !changes.ok) {
    return {
      fieldErrors: {
        ...(validation.ok ? {} : validation.fieldErrors),
        ...(changes.ok ? {} : changes.fieldErrors),
      },
      values,
    };
  }

  const item = Number.isInteger(challengeId) ? getChallengeById(db, challengeId as number) : null;
  if (!item) return { error: "This challenge doesn't exist.", values };
  if (!canLogAttempt(item.status)) {
    return { error: "This challenge is locked. Master the previous one first.", values };
  }

  const attemptId = insertAttempt(db, item.challenge.id, validation.value, changes.value);
  logger.info(
    `Logged attempt ${attemptId} with ${changes.value.length} recipe changes for challenge ${item.challenge.id}`,
  );
  return {};
}
