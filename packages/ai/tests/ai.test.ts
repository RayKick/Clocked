import { describe, expect, it } from "vitest";

import { createMockAiClient } from "../src/mockAi";

describe("ai mocks", () => {
  const ai = createMockAiClient();

  it("extracts clockable claims", async () => {
    const result = await ai.extractClaim({
      text: "We will ship V2 next week.",
      projectName: "Example Protocol"
    });

    expect(result.verdict).toBe("CLOCKABLE");
  });

  it("evaluates status with human review", async () => {
    const result = await ai.evaluateStatus({
      normalizedClaim: "Example Protocol will ship V2",
      deadlineAt: "2026-04-21T00:00:00.000Z",
      deliveryCriteria: ["V2 is public"],
      nonDeliveryCriteria: [],
      evidenceText: [],
      evidenceUrls: [],
      evaluatedAt: "2026-04-22T00:00:00.000Z"
    });

    expect(result.needsHumanReview).toBe(true);
  });
});
