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

function countAttempts(db: ReturnType<typeof openDatabase>): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM attempts").get() as { n: number }).n;
}

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
});
