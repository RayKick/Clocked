import { describe, expect, it } from "vitest";

import { isPastDeadline, parseDeadlineFromText } from "../src/deadlines";

describe("parseDeadlineFromText", () => {
  it("parses tomorrow relative to source post date", () => {
    const result = parseDeadlineFromText(
      "Mainnet launches tomorrow",
      "2026-04-22T10:00:00.000Z"
    );

    expect(result.deadlineText).toBe("tomorrow");
    expect(result.deadlineAt?.startsWith("2026-04-23")).toBe(true);
    expect(result.requiresReview).toBe(false);
  });

  it("marks next week as reviewable", () => {
    const result = parseDeadlineFromText(
      "V2 next week",
      "2026-04-22T10:00:00.000Z"
    );

    expect(result.deadlineText).toBe("next week");
    expect(result.requiresReview).toBe(true);
    expect(result.deadlineConfidence).toBeLessThan(0.8);
  });
});

describe("isPastDeadline", () => {
  it("detects overdue timestamps", () => {
    expect(isPastDeadline("2026-04-01T00:00:00.000Z", new Date("2026-04-22"))).toBe(
      true
    );
  });
});

