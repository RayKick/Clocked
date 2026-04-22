import { describe, expect, it } from "vitest";

import { evaluateClaimStatus, extractClaim, stitchClaims } from "../src";

describe("mock ai extraction", () => {
  it("extracts a clockable claim", async () => {
    const result = await extractClaim(
      {
        text: "Public beta ships by Friday.",
        sourcePostedAt: "2026-04-22T10:00:00.000Z",
        sourceAuthorHandle: "fixturelabs",
        projectName: "Fixture Labs"
      },
      { mode: "mock" }
    );

    expect(result.verdict).toBe("CLOCKABLE");
    expect(result.deadlineText).toBeTruthy();
  });

  it("evaluates status conservatively", async () => {
    const result = await evaluateClaimStatus(
      {
        normalizedClaim: "Public beta ships by Friday.",
        deliverable: "public beta launch",
        deadlineText: "by Friday",
        deadlineAt: "2026-04-25T23:59:59.000Z",
        deliveryCriteria: ["Public beta is accessible."],
        nonDeliveryCriteria: ["No public beta access is available."],
        evidenceText: ["The public beta is live and available now."],
        evidenceUrls: []
      },
      { mode: "mock" }
    );

    expect(result.proposedStatus).toBe("DELIVERED");
    expect(result.needsHumanReview).toBe(true);
  });

  it("stitches related claims", async () => {
    const result = await stitchClaims(
      {
        primaryClaim: {
          id: "1",
          normalizedClaim: "Mainnet launches tomorrow.",
          deliverable: "mainnet launch",
          deadlineAt: "2026-04-23T23:59:59.000Z"
        },
        candidateClaims: [
          {
            id: "2",
            normalizedClaim: "Mainnet launch is tomorrow.",
            deliverable: "mainnet launch",
            deadlineAt: "2026-04-23T23:59:59.000Z"
          }
        ]
      },
      { mode: "mock" }
    );

    expect(result.relatedClaimIds).toContain("2");
  });
});
