import { describe, expect, it } from "vitest";
import { logAttemptFor } from "./log-attempt";
import { openDatabase } from "@/lib/db/client";
import { getChallengeBySlug, listJourney } from "@/lib/db/queries";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = { bakedOn: "2026-10-30", rating: "4" };

function count(db: ReturnType<typeof openDatabase>, table: string): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
}
const countAttempts = (db: ReturnType<typeof openDatabase>) => count(db, "attempts");

describe("logAttemptFor", () => {
  it("refuses a locked challenge and saves nothing", () => {
    const db = openDatabase(":memory:");
    const locked = listJourney(db)[1].challenge.id;

    const result = logAttemptFor(db, locked, form(VALID));

    expect(result.error).toMatch(/locked/);
    expect(result.values?.rating).toBe("4");
    expect(countAttempts(db)).toBe(0);
  });

  it.each([9999, "1"])("refuses a challenge id that is not a real integer id (%j)", (id) => {
    const db = openDatabase(":memory:");

    const result = logAttemptFor(db, id, form(VALID));

    expect(result.error).toBe("This challenge doesn't exist.");
    expect(result.values?.rating).toBe("4");
    expect(countAttempts(db)).toBe(0);
  });

  it("returns field errors and the submitted values when the rating is missing", () => {
    const db = openDatabase(":memory:");
    const first = listJourney(db)[0].challenge.id;

    const result = logAttemptFor(db, first, form({ bakedOn: "2026-10-30" }));

    expect(result.fieldErrors?.rating).toBeDefined();
    expect(result.values?.rating).toBe("");
    expect(countAttempts(db)).toBe(0);
  });

  it("saves a valid attempt and moves the challenge to in progress", () => {
    const db = openDatabase(":memory:");
    const first = listJourney(db)[0].challenge.id;

    expect(logAttemptFor(db, first, form(VALID))).toEqual({});

    expect(countAttempts(db)).toBe(1);
    expect(getChallengeBySlug(db, "banana-bread")?.status).toBe("in_progress");
  });

  describe("recipe changes", () => {
    it("saves the attempt with its changes and skips a blank row", () => {
      const db = openDatabase(":memory:");
      const first = listJourney(db)[0].challenge.id;

      const result = logAttemptFor(
        db,
        first,
        form({
          ...VALID,
          "changes.0.description": "hydration 65% → 70%",
          "changes.0.outcome": "more open crumb",
          "changes.1.description": "  ",
          "changes.1.outcome": "",
          "changes.2.description": "less sugar",
        }),
      );

      expect(result).toEqual({});
      const [attempt] = getChallengeBySlug(db, "banana-bread")!.attempts;
      expect(attempt.changes.map((c) => [c.description, c.outcome])).toEqual([
        ["hydration 65% → 70%", "more open crumb"],
        ["less sugar", null],
      ]);
    });

    it("rejects an outcome without a description, echoes the rows and saves nothing", () => {
      const db = openDatabase(":memory:");
      const first = listJourney(db)[0].challenge.id;

      const result = logAttemptFor(
        db,
        first,
        form({ ...VALID, "changes.0.description": "", "changes.0.outcome": "denser" }),
      );

      expect(result.fieldErrors?.["changes.0.description"]).toBeDefined();
      expect(result.values?.["changes.0.outcome"]).toBe("denser");
      expect(countAttempts(db)).toBe(0);
      expect(count(db, "recipe_changes")).toBe(0);
    });

    it("reports a missing rating and a change error together", () => {
      const db = openDatabase(":memory:");
      const first = listJourney(db)[0].challenge.id;

      const result = logAttemptFor(
        db,
        first,
        form({ bakedOn: "2026-10-30", "changes.0.description": "", "changes.0.outcome": "x" }),
      );

      expect(Object.keys(result.fieldErrors ?? {}).sort()).toEqual([
        "changes.0.description",
        "rating",
      ]);
    });

    it("echoes the change rows when the challenge is locked", () => {
      const db = openDatabase(":memory:");
      const locked = listJourney(db)[1].challenge.id;

      const result = logAttemptFor(
        db,
        locked,
        form({ ...VALID, "changes.0.description": "less sugar", "changes.0.outcome": "" }),
      );

      expect(result.error).toMatch(/locked/);
      expect(result.values?.["changes.0.description"]).toBe("less sugar");
      expect(count(db, "recipe_changes")).toBe(0);
    });

    it("reads every submitted row even when the indexes have gaps", () => {
      const db = openDatabase(":memory:");
      const id = listJourney(db)[0].challenge.id;

      const result = logAttemptFor(
        db,
        id,
        form({
          ...VALID,
          "changes.0.description": "less sugar",
          "changes.2.description": "more salt",
          "changes.2.outcome": "tastier",
        }),
      );

      expect(result).toEqual({});
      const [attempt] = getChallengeBySlug(db, "banana-bread")!.attempts;
      expect(attempt.changes.map((c) => [c.description, c.outcome])).toEqual([
        ["less sugar", null],
        ["more salt", "tastier"],
      ]);
    });

    it("rejects a row that sends only an outcome instead of dropping it", () => {
      const db = openDatabase(":memory:");
      const id = listJourney(db)[0].challenge.id;

      const result = logAttemptFor(db, id, form({ ...VALID, "changes.0.outcome": "denser" }));

      expect(result.fieldErrors?.["changes.0.description"]).toBeDefined();
      expect(result.values?.["changes.0.outcome"]).toBe("denser");
      expect(countAttempts(db)).toBe(0);
    });
  });
});
