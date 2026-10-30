import { describe, expect, it } from "vitest";
import { openDatabase, seedJourney } from "@/lib/db/client";
import { getChallengeBySlug, listJourney } from "@/lib/db/queries";
import { SEED_CHALLENGES } from "@/lib/db/seed-data";
import { LEVELS } from "@/lib/types";

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

  it("goes from easiest to hardest, with 5 challenges per level", () => {
    // The journey page groups by level, so a level going backwards would show challenges out of order.
    const levelIndexes = SEED_CHALLENGES.map((c) => LEVELS.indexOf(c.level));
    expect(levelIndexes).toEqual([...levelIndexes].sort((a, b) => a - b));
    for (const level of LEVELS) {
      expect(SEED_CHALLENGES.filter((c) => c.level === level)).toHaveLength(5);
    }
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

  it("orders attempts on the same date by when they were logged, newest first", () => {
    const db = openDatabase(":memory:");
    const { challenge } = getChallengeBySlug(db, "banana-bread")!;
    const insertAttempt = db.prepare(
      "INSERT INTO attempts (challenge_id, baked_on, notes, rating) VALUES (?, ?, ?, ?)",
    );
    insertAttempt.run(challenge.id, "2026-10-08", "morning", 3);
    insertAttempt.run(challenge.id, "2026-10-08", "evening", 4);

    const { attempts } = getChallengeBySlug(db, "banana-bread")!;
    expect(attempts.map((a) => a.notes)).toEqual(["evening", "morning"]);
  });

  it("keeps each challenge's attempts and changes separate", () => {
    const db = openDatabase(":memory:");
    const bread = getChallengeBySlug(db, "banana-bread")!.challenge;
    const cookies = getChallengeBySlug(db, "chocolate-chip-cookies")!.challenge;
    const insertAttempt = db.prepare(
      "INSERT INTO attempts (challenge_id, baked_on, rating) VALUES (?, ?, ?)",
    );
    insertAttempt.run(bread.id, "2026-10-01", 3);
    const { lastInsertRowid } = insertAttempt.run(cookies.id, "2026-10-02", 4);
    db.prepare("INSERT INTO recipe_changes (attempt_id, description) VALUES (?, ?)").run(
      lastInsertRowid,
      "Chilled the dough",
    );

    const breadDetail = getChallengeBySlug(db, "banana-bread")!;
    expect(breadDetail.progress.attemptCount).toBe(1);
    expect(breadDetail.attempts.flatMap((a) => a.changes)).toEqual([]);

    const cookiesDetail = getChallengeBySlug(db, "chocolate-chip-cookies")!;
    expect(cookiesDetail.progress.attemptCount).toBe(1);
    expect(cookiesDetail.attempts[0].changes.map((c) => c.description)).toEqual([
      "Chilled the dough",
    ]);
  });

  it("returns null for an unknown slug", () => {
    expect(getChallengeBySlug(openDatabase(":memory:"), "nope")).toBeNull();
  });
});
