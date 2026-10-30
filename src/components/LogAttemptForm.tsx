"use client";

import { useActionState, useEffect, useRef } from "react";
import { logAttempt } from "@/app/challenges/[slug]/actions";
import type { ActionResult } from "@/lib/types";

// `submissions` changes the form's key after every submit, so it remounts and the defaults below apply again.
type FormState = ActionResult & { submissions: number };

const INPUT =
  "mt-1 block w-full rounded-md border border-black/20 bg-transparent px-2 py-1.5 dark:border-white/25";

function RatingSelect({
  name,
  label,
  emptyLabel,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  emptyLabel: string;
  defaultValue: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={INPUT}
      >
        <option value="">{emptyLabel}</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function LogAttemptForm({ challengeId, today }: { challengeId: number; today: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (prev, formData) => ({
      ...(await logAttempt(challengeId, prev, formData)),
      submissions: prev.submissions + 1,
    }),
    { submissions: 0 },
  );
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  // The remount drops focus to <body>, so move it to the first invalid field after a rejected submit.
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state.submissions]);

  return (
    // React resets uncontrolled fields after an action. Remounting with a new key makes every field
    // (including the selects) start from the submitted values again, or from empty after a success.
    <form
      key={state.submissions}
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-lg border border-black/10 p-4 dark:border-white/15"
    >
      <h3 className="font-medium">Log attempt</h3>

      <div>
        <label htmlFor="bakedOn" className="text-sm font-medium">
          Date
        </label>
        <input
          id="bakedOn"
          name="bakedOn"
          type="date"
          defaultValue={values.bakedOn ?? today}
          aria-invalid={errors.bakedOn ? true : undefined}
          aria-describedby={errors.bakedOn ? "bakedOn-error" : undefined}
          className={INPUT}
        />
        {errors.bakedOn && (
          <p id="bakedOn-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.bakedOn}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (optional)
        </label>
        <textarea id="notes" name="notes" rows={3} defaultValue={values.notes ?? ""} className={INPUT} />
      </div>

      <RatingSelect
        name="rating"
        label="Overall rating"
        emptyLabel="Choose…"
        defaultValue={values.rating ?? ""}
        error={errors.rating}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <RatingSelect
          name="tasteRating"
          label="Taste (optional)"
          emptyLabel="—"
          defaultValue={values.tasteRating ?? ""}
          error={errors.tasteRating}
        />
        <RatingSelect
          name="textureRating"
          label="Texture (optional)"
          emptyLabel="—"
          defaultValue={values.textureRating ?? ""}
          error={errors.textureRating}
        />
        <RatingSelect
          name="appearanceRating"
          label="Appearance (optional)"
          emptyLabel="—"
          defaultValue={values.appearanceRating ?? ""}
          error={errors.appearanceRating}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {pending ? "Saving…" : "Log attempt"}
      </button>
    </form>
  );
}
