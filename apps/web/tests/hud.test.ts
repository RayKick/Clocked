import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/data", () => ({
  getProjectRecordBySlug: vi.fn(async () => ({
    project: { slug: "example-protocol" }
  })),
  getHudPayload: vi.fn(async () => ({
    projectSlug: "example-protocol",
    projectName: "Example Protocol",
    openClaims: 1,
    dueSoonClaims: 1,
    deliveredCount: 1,
    slippedCount: 0,
    reframedCount: 0,
    latestClaim: {
      slug: "example-protocol-will-ship-v2-next-week",
      status: "OPEN",
      claim: "Example Protocol will ship V2 next week."
    },
    latestStatusChange: {
      toStatus: "OPEN",
      at: "2026-04-22T12:40:19.273Z"
    },
    publicRecordUrl: "http://localhost:3002/p/example-protocol",
    recordCopy: "1 open claim, 1 delivered claim, and 0 slipped claims in the public record.",
    riskCopy: "1 open claim, 1 delivered claim, and 0 slipped claims in the public record."
  }))
}));

describe("hud route", () => {
  it("returns neutral record copy in public-safe mode", async () => {
    const { GET } = await import("../app/api/hud/project/[slug]/route");
    const response = await GET(new Request("http://localhost:3002/api/hud/project/example-protocol"), {
      params: Promise.resolve({ slug: "example-protocol" })
    });
    const payload = (await response.json()) as Record<string, string>;

    expect(payload.recordCopy).toBe(
      "1 open claim, 1 delivered claim, and 0 slipped claims in the public record."
    );
    expect(payload.riskCopy).toBe(payload.recordCopy);
  });
});
