import { describe, expect, it } from "vitest";
import { canLogAttempt, toIsoDate, validateAttempt } from "@/lib/domain/attempts";
import type { ChallengeStatus } from "@/lib/types";

describe("validateAttempt", () => {
  it("accepts a fully filled form", () => {
    expect(
      validateAttempt({
        bakedOn: "2026-10-30",
        notes: "  Great crumb  ",
        rating: "4",
        tasteRating: "5",
        textureRating: "3",
        appearanceRating: "4",
      }),
    ).toEqual({
      ok: true,
      value: {
        bakedOn: "2026-10-30",
        notes: "Great crumb",
        rating: 4,
        tasteRating: 5,
        textureRating: 3,
        appearanceRating: 4,
      },
    });
  });

  it("accepts a minimal form: optional ratings become null and blank notes become null", () => {
    expect(
      validateAttempt({
        bakedOn: "2026-10-30",
        notes: "   ",
        rating: "1",
        tasteRating: "",
        textureRating: "",
        appearanceRating: "",
      }),
    ).toEqual({
      ok: true,
      value: {
        bakedOn: "2026-10-30",
        notes: null,
        rating: 1,
        tasteRating: null,
        textureRating: null,
        appearanceRating: null,
      },
    });
  });

  it.each([undefined, "", "0", "6", "3.5", "abc", " "])("rejects overall rating %j", (rating) => {
    const result = validateAttempt({ bakedOn: "2026-10-30", rating });
    expect(result).toEqual({
      ok: false,
      fieldErrors: { rating: "Choose an overall rating from 1 to 5." },
    });
  });

  it("rejects an out-of-range optional rating but accepts an empty one", () => {
    const result = validateAttempt({ bakedOn: "2026-10-30", rating: "3", tasteRating: "7" });
    expect(result).toEqual({
      ok: false,
      fieldErrors: { tasteRating: "Taste rating must be from 1 to 5." },
    });
    expect(validateAttempt({ bakedOn: "2026-10-30", rating: "3", tasteRating: "" }).ok).toBe(true);
  });

  it.each([undefined, "", "2026-13-01", "2026-02-30", "30/10/2026"])(
    "rejects date %j",
    (bakedOn) => {
      expect(validateAttempt({ bakedOn, rating: "3" })).toEqual({
        ok: false,
        fieldErrors: { bakedOn: "Enter a valid date." },
      });
    },
  );

  it("reports every problem at once", () => {
    const result = validateAttempt({ bakedOn: "nope", rating: "", textureRating: "9" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(["bakedOn", "rating", "textureRating"]);
    }
  });
});

describe("toIsoDate", () => {
  it("uses the local date, not UTC", () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("canLogAttempt", () => {
  it.each<[ChallengeStatus, boolean]>([
    ["locked", false],
    ["not_started", true],
    ["in_progress", true],
    ["mastered", true],
  ])("%s -> %s", (status, expected) => {
    expect(canLogAttempt(status)).toBe(expected);
  });
});
