"use client";

import { useEffect, useRef, useState } from "react";
import { INPUT } from "@/components/form-styles";
import { changeField, rowsFromValues } from "@/lib/domain/recipe-changes";
import type { EchoedRecipeChange } from "@/lib/domain/recipe-changes";

const SECONDARY_BUTTON =
  "rounded-md border border-black/20 px-4 py-3 text-sm font-medium dark:border-white/25";

type Row = EchoedRecipeChange & { id: number };

// Field names are indexed (changes.0.description, changes.0.outcome, ...). The input name, input id,
// error key and echoed value all use that same key, and the index is the row's position (0..n-1),
// so it is renumbered when a row is removed. Each row's starting text and error live in row state,
// keyed by a stable id, so they move with the row instead of with the index.
export function RecipeChangeRows({
  values,
  errors,
}: {
  values: Record<string, string>;
  errors: Record<string, string>;
}) {
  // Rows are rebuilt from the echoed values after a rejected submit. After a success there are none.
  const [rows, setRows] = useState<Row[]>(() =>
    rowsFromValues(values, errors).map((row, i) => ({ ...row, id: i })),
  );
  const nextId = useRef(rows.length);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  // Which element to focus once the rows have re-rendered: a row id, or the Add button.
  const pendingFocus = useRef<number | "add" | null>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    if (target === "add") addRef.current?.focus();
    else fieldsetRef.current?.querySelector<HTMLElement>(`[data-row-id="${target}"]`)?.focus();
  }, [rows]);

  function addRow() {
    const id = nextId.current++;
    pendingFocus.current = id;
    setRows((current) => [...current, { id, description: "", outcome: "" }]);
  }

  function removeRow(index: number) {
    pendingFocus.current = rows[index + 1]?.id ?? rows[index - 1]?.id ?? "add";
    const { id } = rows[index];
    setRows((current) => current.filter((row) => row.id !== id));
  }

  return (
    <fieldset ref={fieldsetRef} className="space-y-3">
      <legend className="text-sm font-medium">Recipe changes (optional)</legend>

      {rows.map((row, i) => {
        const description = changeField(i, "description");
        const outcome = changeField(i, "outcome");
        return (
          <fieldset
            key={row.id}
            className="grid gap-3 border-t border-black/10 pt-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end dark:border-white/15"
          >
            <legend className="sr-only">Change {i + 1}</legend>
            <div>
              <label htmlFor={description} className="text-sm font-medium">
                What changed
              </label>
              <input
                id={description}
                name={description}
                type="text"
                data-row-id={row.id}
                defaultValue={row.description}
                aria-invalid={row.error ? true : undefined}
                aria-describedby={row.error ? `${description}-error` : undefined}
                className={INPUT}
              />
              {row.error && (
                <p id={`${description}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {row.error}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={outcome} className="text-sm font-medium">
                Outcome (optional)
              </label>
              <input
                id={outcome}
                name={outcome}
                type="text"
                defaultValue={row.outcome}
                className={INPUT}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove change ${i + 1}`}
              onClick={() => removeRow(i)}
              className={SECONDARY_BUTTON}
            >
              Remove
            </button>
          </fieldset>
        );
      })}

      <button ref={addRef} type="button" onClick={addRow} className={SECONDARY_BUTTON}>
        + Add a recipe change
      </button>
    </fieldset>
  );
}
