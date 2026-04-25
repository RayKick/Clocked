import { describe, expect, it } from "vitest";

import {
  createCanonicalHash,
  createProjectSlug,
  evaluateClockability,
  parseDeadlineFromText
} from "../src";

describe("core", () => {
  it("classifies clockable claims", () => {
    expect(
      evaluateClockability({
        hasConcreteDeliverable: true,
        hasExplicitDeadline: true,
        deadlineSpecificity: "EXPLICIT",
        canEvaluateWithPublicEvidence: true,
        canExplainCriteriaWithoutInventingFacts: true,
        isOfficialSource: true
      }).verdict
    ).toBe("CLOCKABLE");
  });

  it("parses deadline text", () => {
    expect(parseDeadlineFromText("tomorrow", "2026-04-21T00:00:00Z").deadlineAt).toContain(
      "2026-04-22"
    );
  });

  it("creates project slugs", () => {
    expect(createProjectSlug("Hello World")).toBe("hello-world");
  });

  it("creates stable canonical hashes", () => {
    const input = {
      normalizedClaim: "Ship V2",
      projectSlug: "example"
    };

    expect(createCanonicalHash(input)).toBe(createCanonicalHash(input));
  });
});
