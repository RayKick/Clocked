import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  claim: {
    findMany: vi.fn(),
    findUnique: vi.fn()
  },
  project: {
    findUnique: vi.fn()
  }
}));

vi.mock("@clocked/db", () => ({
  prisma: prismaMock
}));

describe("mcp tools", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("validates search_claims input", async () => {
    const { searchClaimsInputSchema } = await import("../tools/searchClaims");
    const parsed = searchClaimsInputSchema.parse({ status: "OPEN", limit: 5 });
    expect(parsed.status).toBe("OPEN");
  });

  it("returns a public-safe search_claims payload", async () => {
    prismaMock.claim.findMany.mockResolvedValue([
      {
        publicSlug: "example-protocol-open-claim",
        project: { name: "Example Protocol" },
        actor: { handle: "examplefounder" },
        status: "OPEN",
        normalizedClaim: "Example Protocol will ship V2 next week.",
        deadlineAt: new Date("2026-04-20T23:59:59.000Z"),
        sourcePost: { url: "https://x.com/examplefounder/status/1" }
      }
    ]);

    const { searchClaimsTool } = await import("../tools/searchClaims");
    const result = await searchClaimsTool({ projectSlug: "example-protocol", limit: 5 });

    expect(result.claims).toEqual([
      {
        slug: "example-protocol-open-claim",
        projectName: "Example Protocol",
        actorHandle: "examplefounder",
        status: "OPEN",
        normalizedClaim: "Example Protocol will ship V2 next week.",
        deadlineAt: "2026-04-20T23:59:59.000Z",
        sourceUrl: "https://x.com/examplefounder/status/1",
        publicUrl: "http://localhost:3000/c/example-protocol-open-claim"
      }
    ]);
  });

  it("returns a public-safe get_claim payload", async () => {
    prismaMock.claim.findUnique.mockResolvedValue({
      publicSlug: "example-protocol-open-claim",
      status: "OPEN",
      normalizedClaim: "Example Protocol will ship V2 next week.",
      sourceQuote: "V2 ships next week.",
      deadlineText: "next week",
      deadlineAt: new Date("2026-04-20T23:59:59.000Z"),
      deliveryCriteriaJson: ["A public V2 release is announced or accessible."],
      nonDeliveryCriteriaJson: ["A teaser or vague update without public release."],
      sourcePost: { url: "https://x.com/examplefounder/status/1" },
      evidences: [
        {
          evidenceType: "SOURCE",
          summary: "Original founder claim captured from X.",
          url: "https://x.com/examplefounder/status/1",
          occurredAt: new Date("2026-04-14T10:00:00.000Z"),
          confidence: 0.98
        }
      ],
      statusEvents: [
        {
          fromStatus: null,
          toStatus: "OPEN",
          reason: "Claim approved from review.",
          createdAt: new Date("2026-04-14T11:00:00.000Z")
        }
      ]
    });

    const { getClaimTool } = await import("../tools/getClaim");
    const result = await getClaimTool({ slug: "example-protocol-open-claim" });

    expect(result.slug).toBe("example-protocol-open-claim");
    expect(result.evidence[0]).toMatchObject({
      evidenceType: "SOURCE",
      summary: "Original founder claim captured from X."
    });
    expect(result.statusHistory[0]).toMatchObject({
      toStatus: "OPEN",
      reason: "Claim approved from review."
    });
  });

  it("returns a public-safe get_project_record payload", async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      slug: "example-protocol",
      name: "Example Protocol",
      description: "Dry-run project.",
      officialXHandle: "exampleprotocol",
      claims: [
        {
          publicSlug: "example-protocol-open-claim",
          status: "OPEN",
          normalizedClaim: "Example Protocol will ship V2 next week.",
          deadlineAt: new Date("2026-04-20T23:59:59.000Z"),
          createdAt: new Date("2026-04-14T10:00:00.000Z"),
          statusEvents: [
            {
              claimId: "claim-1",
              toStatus: "OPEN",
              reason: "Claim approved from review.",
              createdAt: new Date("2026-04-14T11:00:00.000Z")
            }
          ]
        },
        {
          publicSlug: "example-protocol-delivered-claim",
          status: "DELIVERED",
          normalizedClaim: "Example Protocol will publish the public beta by April 20.",
          deadlineAt: new Date("2026-04-20T23:59:59.000Z"),
          createdAt: new Date("2026-04-18T10:00:00.000Z"),
          statusEvents: [
            {
              claimId: "claim-2",
              toStatus: "DELIVERED",
              reason: "Public beta access links were posted before the recorded deadline.",
              createdAt: new Date("2026-04-18T11:00:00.000Z")
            }
          ]
        }
      ]
    });

    const { getProjectRecordTool } = await import("../tools/getProjectRecord");
    const result = await getProjectRecordTool({ projectSlug: "example-protocol" });

    expect(result.project).toEqual({
      slug: "example-protocol",
      name: "Example Protocol",
      description: "Dry-run project.",
      officialXHandle: "exampleprotocol"
    });
    expect(result.countsByStatus.DELIVERED).toBe(1);
    expect(result.latestStatusChanges[0]).toMatchObject({
      toStatus: "DELIVERED"
    });
  });

  it("keeps extract_claim_from_text safe in mock mode", async () => {
    const { extractClaimFromTextTool } = await import("../tools/extractClaimFromText");
    const result = await extractClaimFromTextTool({
      text: "V2 ships next week.",
      sourcePostedAt: "2026-04-14T10:00:00.000Z",
      sourceAuthorHandle: "examplefounder",
      projectName: "Example Protocol"
    });

    expect(result.verdict).toBe("CLOCKABLE");
    expect(result.normalizedClaim).toContain("next week");
  });
});
