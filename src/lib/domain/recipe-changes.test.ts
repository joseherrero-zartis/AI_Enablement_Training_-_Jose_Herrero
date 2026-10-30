import { describe, expect, it } from "vitest";
import { changeField, rowsFromValues, validateRecipeChanges } from "@/lib/domain/recipe-changes";

describe("validateRecipeChanges", () => {
  it("accepts no rows", () => {
    expect(validateRecipeChanges([])).toEqual({ ok: true, value: [] });
  });

  it("skips rows where both fields are blank or whitespace", () => {
    expect(
      validateRecipeChanges([
        { description: "", outcome: "" },
        { description: "  ", outcome: " " },
      ]),
    ).toEqual({ ok: true, value: [] });
  });

  it("trims text and turns an empty outcome into null", () => {
    expect(
      validateRecipeChanges([
        { description: "  hydration 65% → 70% ", outcome: " more open crumb " },
        { description: "less sugar", outcome: "  " },
      ]),
    ).toEqual({
      ok: true,
      value: [
        { description: "hydration 65% → 70%", outcome: "more open crumb" },
        { description: "less sugar", outcome: null },
      ],
    });
  });

  it("rejects an outcome without a description, keyed by the submitted row", () => {
    expect(
      validateRecipeChanges([
        { description: "", outcome: "" },
        { description: "", outcome: "denser" },
      ]),
    ).toEqual({
      ok: false,
      fieldErrors: { "changes.1.description": "Describe the change, or remove this row." },
    });
  });

  it("reports every bad row at once", () => {
    const result = validateRecipeChanges([
      { description: "", outcome: "a" },
      { description: "ok", outcome: "" },
      { description: "", outcome: "b" },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors)).toEqual([
        changeField(0, "description"),
        changeField(2, "description"),
      ]);
    }
  });

  it("keeps the order of the rows", () => {
    const result = validateRecipeChanges([
      { description: "b", outcome: "" },
      { description: "a", outcome: "" },
    ]);
    expect(result.ok && result.value.map((c) => c.description)).toEqual(["b", "a"]);
  });

  it("rejects a whitespace-only description that has an outcome", () => {
    const result = validateRecipeChanges([{ description: "   ", outcome: "denser" }]);
    expect(result).toEqual({
      ok: false,
      fieldErrors: { [changeField(0, "description")]: "Describe the change, or remove this row." },
    });
  });
});

describe("rowsFromValues", () => {
  it("returns no rows when nothing was echoed", () => {
    expect(rowsFromValues({ rating: "" }, {})).toEqual([]);
  });

  it("gives each row its own text and error", () => {
    expect(
      rowsFromValues(
        {
          "changes.0.description": "",
          "changes.0.outcome": "denser",
          "changes.1.description": "less sugar",
          "changes.1.outcome": "",
        },
        { "changes.0.description": "Describe the change, or remove this row." },
      ),
    ).toEqual([
      { description: "", outcome: "denser", error: "Describe the change, or remove this row." },
      { description: "less sugar", outcome: "", error: undefined },
    ]);
  });
});
