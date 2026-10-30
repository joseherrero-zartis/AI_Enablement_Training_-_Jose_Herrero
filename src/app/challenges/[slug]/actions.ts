"use server";

import { refresh, revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/client";
import type { ActionResult } from "@/lib/types";
import { logAttemptFor } from "./log-attempt";

// F2: Log an attempt. The challenge id is bound by the form, so the locked check in logAttemptFor is the real guard.
export async function logAttempt(
  challengeId: number,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const result = logAttemptFor(getDb(), challengeId, formData);
  if (result.error || result.fieldErrors) return result;

  refresh();
  // The journey list and the dashboard show the status, which can change after the first attempt.
  revalidatePath("/journey");
  revalidatePath("/");
  return {};
}
