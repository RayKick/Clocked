import { describe, expect, it } from "vitest";

import { FIXTURE_IDS, buildFixturePayloads } from "../src/fixtureWorker";

describe("fixture worker", () => {
  it("uses deterministic fixture ids", () => {
    expect(FIXTURE_IDS.clockablePostId).toBe("fixture-example-clockable-post");
    expect(FIXTURE_IDS.claimCreateReason).toContain("Example Protocol");
  });

  it("builds stable dry-run payloads", () => {
    const payloads = buildFixturePayloads();

    expect(payloads.clockableReviewPayload.verdict).toBe("CLOCKABLE");
    expect(payloads.clockableReviewPayload.normalizedClaim).toBe(
      "Example Protocol will ship V2 next week."
    );
    expect(payloads.notClockableReviewPayload.notClockableReason).toBe(
      "Missing concrete deliverable and bounded deadline."
    );
    expect(payloads.ambiguousReviewPayload.verdict).toBe("NEEDS_REVIEW");
    expect(payloads.heyanonEvidencePayload.rawJson).toMatchObject({ mocked: true });
  });
});
