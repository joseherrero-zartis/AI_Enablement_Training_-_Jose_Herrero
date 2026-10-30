import { describe, expect, it } from "vitest";
import {
  getChallengeToUnlock,
  getStatus,
  meetsMasteryHint,
  summarizeProgress,
} from "@/lib/domain/journey";
import type { Challenge, ChallengeProgress, ChallengeStatus, Level } from "@/lib/types";

function challenge(position: number, level: Level = "beginner"): Challenge {
  return {
    id: position * 10,
    slug: `challenge-${position}`,
    position,
    title: `Challenge ${position}`,
    technique: "Technique",
    level,
    description: "",
    recipe: null,
  };
}

function progress(overrides: Partial<ChallengeProgress> = {}): ChallengeProgress {
  return {
    challengeId: 1,
    unlockedAt: null,
    masteredAt: null,
    masteryNote: null,
    attemptCount: 0,
    ...overrides,
  };
}

describe("getStatus", () => {
  it("is locked when never unlocked", () => {
    expect(getStatus(progress())).toBe("locked");
  });

  it("is not started when unlocked without attempts", () => {
    expect(getStatus(progress({ unlockedAt: "2026-10-19" }))).toBe("not_started");
  });

  it("is in progress once an attempt is logged", () => {
    expect(getStatus(progress({ unlockedAt: "2026-10-19", attemptCount: 2 }))).toBe(
      "in_progress",
    );
  });

  it("is mastered when marked mastered, regardless of attempts", () => {
    expect(
      getStatus(progress({ unlockedAt: "2026-10-19", masteredAt: "2026-10-20", attemptCount: 3 })),
    ).toBe("mastered");
  });
});

describe("getChallengeToUnlock", () => {
  const challenges = [challenge(3), challenge(1), challenge(2)];

  it("returns the next challenge in journey order", () => {
    expect(getChallengeToUnlock(challenges, 10)?.position).toBe(2);
  });

  it("returns null for the last challenge", () => {
    expect(getChallengeToUnlock(challenges, 30)).toBeNull();
  });

  it("returns null for an unknown challenge", () => {
    expect(getChallengeToUnlock(challenges, 999)).toBeNull();
  });
});

describe("meetsMasteryHint", () => {
  it("needs three attempts rated 4 or more", () => {
    expect(meetsMasteryHint([5, 4, 3, 2])).toBe(false);
    expect(meetsMasteryHint([5, 4, 4, 1])).toBe(true);
  });

  it("is met by exactly three attempts rated 4", () => {
    expect(meetsMasteryHint([4, 4, 4])).toBe(true);
  });

  it("is not met without attempts", () => {
    expect(meetsMasteryHint([])).toBe(false);
  });
});

describe("summarizeProgress", () => {
  const item = (position: number, status: ChallengeStatus, level: Level = "beginner") => ({
    challenge: challenge(position, level),
    status,
  });

  it("counts mastered challenges and finds the next one", () => {
    const summary = summarizeProgress([
      item(1, "mastered"),
      item(2, "in_progress", "intermediate"),
      item(3, "locked", "intermediate"),
    ]);
    expect(summary).toMatchObject({
      mastered: 1,
      total: 3,
      percent: 33,
      complete: false,
      currentLevel: "intermediate",
    });
    expect(summary.nextChallenge?.position).toBe(2);
  });

  it("goes back to an earlier challenge whose mastery was undone", () => {
    // Undoing #1 never re-locks #2, so a later challenge can be mastered while an earlier one isn't.
    // Items are out of order to check the sort.
    const summary = summarizeProgress([
      item(3, "not_started"),
      item(1, "not_started"),
      item(2, "mastered"),
    ]);
    expect(summary.nextChallenge?.position).toBe(1);
    expect(summary.mastered).toBe(1);
  });

  it("is complete once everything is mastered", () => {
    const summary = summarizeProgress([item(1, "mastered"), item(2, "mastered", "master")]);
    expect(summary).toMatchObject({ percent: 100, complete: true, currentLevel: "master" });
    expect(summary.nextChallenge).toBeNull();
  });

  it("is not complete for an empty journey", () => {
    expect(summarizeProgress([])).toMatchObject({ percent: 0, complete: false });
  });
});
