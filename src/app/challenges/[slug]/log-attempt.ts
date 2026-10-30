// The logic behind the log-attempt Server Action. No Next imports, so it can be tested with an in-memory DB.
import type { Db } from "@/lib/db/client";
import { getChallengeById, insertAttempt } from "@/lib/db/queries";
import { canLogAttempt, validateAttempt } from "@/lib/domain/attempts";
import type { AttemptField, RawAttemptInput } from "@/lib/domain/attempts";
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

/** Parse, validate, check the challenge, then write. Expected errors are returned, never thrown. */
export function logAttemptFor(db: Db, challengeId: unknown, formData: FormData): ActionResult {
  const raw: RawAttemptInput = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    raw[field] = typeof value === "string" ? value : "";
  }

  const validation = validateAttempt(raw);
  if (!validation.ok) return { fieldErrors: validation.fieldErrors, values: raw };

  const item = Number.isInteger(challengeId) ? getChallengeById(db, challengeId as number) : null;
  if (!item) return { error: "This challenge doesn't exist.", values: raw };
  if (!canLogAttempt(item.status)) {
    return { error: "This challenge is locked. Master the previous one first.", values: raw };
  }

  const attemptId = insertAttempt(db, item.challenge.id, validation.value);
  logger.info(`Logged attempt ${attemptId} for challenge ${item.challenge.id}`);
  return {};
}
