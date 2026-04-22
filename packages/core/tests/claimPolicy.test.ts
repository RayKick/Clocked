import { describe, expect, it } from "vitest";

import {
  evaluateClockability,
  getDeadlineGuidance,
  shouldRequireReviewForStatusChange
} from "../src/claimPolicy";
import { sanitizePublicCopy } from "../src/copy";

describe("claim policy", () => {
  it("classifies concrete official claims as clockable", () => {
    const result = evaluateClockability({
      isOfficialSource: true,
      hasConcreteDeliverable: true,
      hasExplicitDeadline: true,
      deadlineSpecificity: "EXPLICIT",
      canEvaluateWithPublicEvidence: true,
      canExplainCriteriaWithoutInventingFacts: true
    });

    expect(result.verdict).toBe("CLOCKABLE");
  });

  it("pushes hedged timing to review", () => {
    const result = evaluateClockability({
      isOfficialSource: true,
      hasConcreteDeliverable: true,
      hasExplicitDeadline: true,
      deadlineSpecificity: "APPROXIMATE",
      canEvaluateWithPublicEvidence: true,
      canExplainCriteriaWithoutInventingFacts: true,
      containsHedgingLanguage: true
    });

    expect(result.verdict).toBe("NEEDS_REVIEW");
  });

  it("requires review for slipped status changes after deadlines", () => {
    const result = shouldRequireReviewForStatusChange({
      currentStatus: "OPEN",
      proposedStatus: "SLIPPED",
      deadlinePassed: true,
      evidenceConfidence: 0.7
    });

    expect(result.requiresReview).toBe(true);
  });

  it("returns bounded guidance for next-week style claims", () => {
    const guidance = getDeadlineGuidance("BOUNDED");
    expect(guidance.shouldAutoCreateClaim).toBe(true);
  });

  it("sanitizes defamatory terms from public copy", () => {
    expect(sanitizePublicCopy("This project is a scam and the founder lied.")).not.toContain(
      "scam"
    );
  });
});

