import { describe, expect, it } from "vitest";
import { openDatabase, seedJourney } from "@/lib/db/client";
import { getChallengeBySlug, listJourney } from "@/lib/db/queries";
import { SEED_CHALLENGES } from "@/lib/db/seed-data";

describe("seeded journey", () => {
  it("contains every seed challenge in order, with only the first unlocked", () => {
    const journey = listJourney(openDatabase(":memory:"));

    expect(journey.map((item) => item.challenge.slug)).toEqual(
      SEED_CHALLENGES.map((c) => c.slug),
    );
    expect(journey[0].status).toBe("not_started");
    expect(journey.slice(1).every((item) => item.status === "locked")).toBe(true);
  });

  it("does not seed twice", () => {
    const db = openDatabase(":memory:");
    seedJourney(db);
    expect(listJourney(db)).toHaveLength(SEED_CHALLENGES.length);
  });
});

describe("getChallengeBySlug", () => {
  it("returns attempts newest first with their recipe changes", () => {
    const db = openDatabase(":memory:");
    const { challenge } = getChallengeBySlug(db, "banana-bread")!;

    const insertAttempt = db.prepare(
      "INSERT INTO attempts (challenge_id, baked_on, rating) VALUES (?, ?, ?)",
    );
    insertAttempt.run(challenge.id, "2026-10-01", 3);
    const { lastInsertRowid } = insertAttempt.run(challenge.id, "2026-10-08", 4);
    db.prepare("INSERT INTO recipe_changes (attempt_id, description) VALUES (?, ?)").run(
      lastInsertRowid,
      "Baked 5 min longer",
    );

    const detail = getChallengeBySlug(db, "banana-bread")!;
    expect(detail.status).toBe("in_progress");
    expect(detail.attempts.map((a) => a.bakedOn)).toEqual(["2026-10-08", "2026-10-01"]);
    expect(detail.attempts[0].changes.map((c) => c.description)).toEqual(["Baked 5 min longer"]);
    expect(detail.attempts[1].changes).toEqual([]);
  });

  it("returns null for an unknown slug", () => {
    expect(getChallengeBySlug(openDatabase(":memory:"), "nope")).toBeNull();
  });
});
