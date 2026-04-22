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

  it("normalizes the rewards dashboard ingest demo cleanly", async () => {
    const result = await extractClaim(
      {
        text: "Rewards dashboard ships by Friday.",
        sourcePostedAt: "2026-04-16T09:00:00.000Z",
        sourceAuthorHandle: "examplefounder",
        projectName: "Example Protocol"
      },
      { mode: "mock" }
    );

    expect(result).toMatchObject({
      verdict: "CLOCKABLE",
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday.",
      sourceQuote: "Rewards dashboard ships by Friday.",
      deliverable: "rewards dashboard",
      deadlineText: "by Friday"
    });
    expect(result.normalizedClaim?.toLowerCase()).not.toContain("by by");
    expect(result.deliveryCriteria).toEqual([
      "A public rewards dashboard is announced or accessible.",
      "The release is attributable to Example Protocol."
    ]);
    expect(result.nonDeliveryCriteria).toEqual([
      "A teaser, waitlist, or vague update without a public rewards dashboard.",
      "A delayed or reframed announcement without delivery."
    ]);
  });

  it("marks vague hype as not clockable with a factual reason", async () => {
    const result = await extractClaim(
      {
        text: "Big things coming soon.",
        sourcePostedAt: "2026-04-22T10:00:00.000Z",
        sourceAuthorHandle: "examplefounder",
        projectName: "Example Protocol"
      },
      { mode: "mock" }
    );

    expect(result.verdict).toBe("NOT_CLOCKABLE");
    expect(result.notClockableReason).toBe("Missing concrete deliverable and bounded deadline.");
  });

  it("marks tentative beta timing as needs review", async () => {
    const result = await extractClaim(
      {
        text: "Beta soon, probably next week.",
        sourcePostedAt: "2026-04-22T10:00:00.000Z",
        sourceAuthorHandle: "examplefounder",
        projectName: "Example Protocol"
      },
      { mode: "mock" }
    );

    expect(result.verdict).toBe("NEEDS_REVIEW");
    expect(result.ambiguityNotes).toContain("Deliverable or deadline is ambiguous.");
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
