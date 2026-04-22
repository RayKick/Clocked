import { describe, expect, it } from "vitest";

import { FIXTURE_IDS, buildFixturePayloads } from "../src/fixtureWorker";

describe("fixture worker", () => {
  it("uses deterministic fixture ids", () => {
    expect(FIXTURE_IDS.approvedOpenClaimPostId).toBe("fixture-example-clocked-open-post");
    expect(FIXTURE_IDS.pendingClaimCreatePostId).toBe(
      "fixture-example-pending-claim-create-post"
    );
    expect(FIXTURE_IDS.claimCreateReason).toContain("Example Protocol");
  });

  it("builds stable dry-run payloads", () => {
    const payloads = buildFixturePayloads();

    expect(payloads.approvedOpenClaim.verdict).toBe("CLOCKABLE");
    expect(payloads.approvedOpenClaim.normalizedClaim).toBe(
      "Example Protocol will ship V2 next week."
    );
    expect(payloads.pendingClaimCreateReviewPayload.normalizedClaim).toBe(
      "Example Protocol will publish updated docs by Friday."
    );
    expect(payloads.notClockableReviewPayload.notClockableReason).toBe(
      "Missing concrete deliverable and bounded deadline."
    );
    expect(payloads.ambiguousReviewPayload.verdict).toBe("NEEDS_REVIEW");
    expect(payloads.heyanonEvidencePayload.rawJson).toMatchObject({ mocked: true });
    expect(payloads.deliveredClaim.normalizedClaim).toBe(
      "Example Protocol will publish its audit report by Friday."
    );
  });
});
