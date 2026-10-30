// Pure recipe-change rules (PRD F3). No database or Next imports, so these are easy to unit test.

/** One row of the form, as submitted. */
export type RawRecipeChange = { description: string; outcome: string };

export interface RecipeChangeInput {
  description: string;
  outcome: string | null;
}

export type RecipeChangesValidation =
  | { ok: true; value: RecipeChangeInput[] }
  | { ok: false; fieldErrors: Record<string, string> };

/** Field name for row `i`. The form, the errors and the echoed values all use this same key. */
export const changeField = (i: number, f: "description" | "outcome") => `changes.${i}.${f}`;

/** A form row rebuilt from an echoed result, with its own text and error. */
export interface EchoedRecipeChange {
  description: string;
  outcome: string;
  error?: string;
}

/**
 * Turns the echoed values and errors (keyed by row index) into one object per row. The form copies these
 * into its row state once, so each row keeps its own text and error when another row is removed.
 */
export function rowsFromValues(
  values: Record<string, string>,
  errors: Record<string, string>,
): EchoedRecipeChange[] {
  const rows: EchoedRecipeChange[] = [];
  for (let i = 0; values[changeField(i, "description")] !== undefined; i++) {
    rows.push({
      description: values[changeField(i, "description")],
      outcome: values[changeField(i, "outcome")] ?? "",
      error: errors[changeField(i, "description")],
    });
  }
  return rows;
}

/** Blank rows are skipped. A row with an outcome but no description is an error, so nothing the baker typed is dropped silently. */
export function validateRecipeChanges(rows: RawRecipeChange[]): RecipeChangesValidation {
  const value: RecipeChangeInput[] = [];
  const fieldErrors: Record<string, string> = {};

  rows.forEach((row, i) => {
    const description = row.description.trim();
    const outcome = row.outcome.trim();
    if (!description && !outcome) return;
    if (!description) {
      fieldErrors[changeField(i, "description")] = "Describe the change, or remove this row.";
      return;
    }
    value.push({ description, outcome: outcome || null });
  });

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value };
}
