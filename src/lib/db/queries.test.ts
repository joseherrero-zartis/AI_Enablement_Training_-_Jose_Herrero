import { describe, expect, it } from "vitest";
import { openDatabase, seedJourney } from "@/lib/db/client";
import { getChallengeById, getChallengeBySlug, insertAttempt, listJourney } from "@/lib/db/queries";
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

describe("insertAttempt", () => {
  it("saves every field and moves the challenge from not started to in progress", () => {
    const db = openDatabase(":memory:");
    const before = getChallengeBySlug(db, "banana-bread")!;
    expect(before.status).toBe("not_started");

    const id = insertAttempt(db, before.challenge.id, {
      bakedOn: "2026-10-30",
      notes: "Great crumb",
      rating: 4,
      tasteRating: 5,
      textureRating: null,
      appearanceRating: 3,
    });

    const after = getChallengeBySlug(db, "banana-bread")!;
    expect(after.status).toBe("in_progress");
    expect(after.attempts).toHaveLength(1);
    expect(after.attempts[0]).toMatchObject({
      id,
      challengeId: before.challenge.id,
      bakedOn: "2026-10-30",
      notes: "Great crumb",
      rating: 4,
      tasteRating: 5,
      textureRating: null,
      appearanceRating: 3,
    });
  });

  it("is backed by a database check on the rating", () => {
    const db = openDatabase(":memory:");
    const id = listJourney(db)[0].challenge.id;
    expect(() =>
      db
        .prepare("INSERT INTO attempts (challenge_id, baked_on, rating) VALUES (?, '2026-10-30', 6)")
        .run(id),
    ).toThrow();
  });
});

describe("getChallengeById", () => {
  it("returns the challenge with its derived status", () => {
    const db = openDatabase(":memory:");
    const first = getChallengeBySlug(db, "banana-bread")!;
    expect(getChallengeById(db, first.challenge.id)?.status).toBe("not_started");

    const second = listJourney(db)[1];
    expect(getChallengeById(db, second.challenge.id)?.status).toBe("locked");
  });

  it("returns null for an unknown id", () => {
    expect(getChallengeById(openDatabase(":memory:"), 9999)).toBeNull();
  });
});

describe("insertAttempt with recipe changes", () => {
  const input = {
    bakedOn: "2026-10-30",
    notes: null,
    rating: 3,
    tasteRating: null,
    textureRating: null,
    appearanceRating: null,
  };
  const count = (db: ReturnType<typeof openDatabase>, table: string) =>
    (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;

  it("saves the changes in order, linked to the attempt", () => {
    const db = openDatabase(":memory:");
    const { challenge } = getChallengeBySlug(db, "banana-bread")!;

    const id = insertAttempt(db, challenge.id, input, [
      { description: "hydration 65% → 70%", outcome: "more open crumb" },
      { description: "less sugar", outcome: null },
    ]);

    const [attempt] = getChallengeBySlug(db, "banana-bread")!.attempts;
    expect(attempt.id).toBe(id);
    expect(attempt.changes.map((c) => [c.attemptId, c.description, c.outcome])).toEqual([
      [id, "hydration 65% → 70%", "more open crumb"],
      [id, "less sugar", null],
    ]);
  });

  it("saves nothing if one of the changes fails", () => {
    const db = openDatabase(":memory:");
    const { challenge } = getChallengeBySlug(db, "banana-bread")!;

    expect(() =>
      insertAttempt(db, challenge.id, input, [
        { description: "fine", outcome: null },
        { description: null as unknown as string, outcome: null },
      ]),
    ).toThrow();

    expect(count(db, "attempts")).toBe(0);
    expect(count(db, "recipe_changes")).toBe(0);
  });
});
