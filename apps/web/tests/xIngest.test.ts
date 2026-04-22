import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  project: { findUnique: vi.fn() },
  actor: { findUnique: vi.fn() },
  sourcePost: { upsert: vi.fn() },
  trigger: { upsert: vi.fn() },
  reviewItem: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  claim: { create: vi.fn(), upsert: vi.fn() }
}));

const aiMock = vi.hoisted(() => ({
  extractClaim: vi.fn()
}));

const xClientMock = vi.hoisted(() => ({
  parseXUrl: vi.fn((url: string) => ({
    platform: "X",
    handle: "examplefounder",
    postId: "1234567890",
    canonicalUrl: url.replace("?s=20", "")
  })),
  canReadFromX: vi.fn(() => ({
    ok: false,
    reason: "X_READ_ENABLED=false blocks live X reads."
  })),
  createXClient: vi.fn(),
  readXEnvironment: vi.fn(() => ({
    X_API_BASE_URL: "https://api.x.com",
    X_READ_ENABLED: false,
    X_POSTING_ENABLED: false,
    SAFE_DRY_RUN: true,
    CLOCKED_BOT_HANDLE: "ClockedBot"
  }))
}));

vi.mock("@clocked/db", () => ({
  prisma: prismaMock
}));

vi.mock("@clocked/ai", () => aiMock);

vi.mock("@clocked/x-client", () => xClientMock);

const originalEnv = { ...process.env };

describe("x ingest helper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv, SAFE_DRY_RUN: "true", X_READ_ENABLED: "false" };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("creates a review item in local dry-run without creating a public claim", async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: "project-1",
      slug: "example-protocol",
      name: "Example Protocol"
    });
    prismaMock.actor.findUnique.mockResolvedValue({
      id: "actor-1",
      handle: "examplefounder",
      project: {
        id: "project-1",
        slug: "example-protocol",
        name: "Example Protocol"
      }
    });
    aiMock.extractClaim.mockResolvedValue({
      verdict: "CLOCKABLE",
      confidence: 0.87,
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday.",
      sourceQuote: "Rewards dashboard ships by Friday.",
      deliverable: "rewards dashboard",
      deadlineText: "by Friday",
      deadlineAt: "2026-04-17T23:59:59.000Z",
      deadlineTimezone: "UTC",
      deadlineConfidence: 0.92,
      deliveryCriteria: [
        "A public rewards dashboard is announced or accessible.",
        "The release is attributable to Example Protocol."
      ],
      nonDeliveryCriteria: [
        "A teaser, waitlist, or vague update without a public rewards dashboard.",
        "A delayed or reframed announcement without delivery."
      ],
      ambiguityNotes: []
    });
    prismaMock.sourcePost.upsert.mockResolvedValue({ id: "source-1" });
    prismaMock.trigger.upsert.mockResolvedValue({ id: "trigger-1" });
    prismaMock.reviewItem.findFirst.mockResolvedValue(null);
    prismaMock.reviewItem.create.mockResolvedValue({ id: "review-1" });

    const { ingestXPost } = await import("../lib/xIngest");
    const result = await ingestXPost({
      url: "https://x.com/examplefounder/status/1234567890",
      sourceText: "Rewards dashboard ships by Friday.",
      projectSlug: "example-protocol",
      actorHandle: "examplefounder"
    });

    expect(result).toMatchObject({
      reviewItemId: "review-1",
      verdict: "CLOCKABLE",
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday."
    });
    expect(prismaMock.reviewItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "CLAIM_CREATE",
          payloadJson: expect.objectContaining({
            normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday."
          })
        })
      })
    );
    expect(prismaMock.reviewItem.create).toHaveBeenCalledOnce();
    expect(prismaMock.claim.create).not.toHaveBeenCalled();
    expect(prismaMock.claim.upsert).not.toHaveBeenCalled();
    expect(xClientMock.createXClient).not.toHaveBeenCalled();
  });

  it("fails clearly when live X reads are disabled and no source text is provided", async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);
    prismaMock.actor.findUnique.mockResolvedValue(null);
    xClientMock.parseXUrl.mockReturnValueOnce({
      platform: "X",
      handle: "unknownfounder",
      postId: "9999999999",
      canonicalUrl: "https://x.com/unknownfounder/status/9999999999"
    });

    const { ingestXPost } = await import("../lib/xIngest");

    await expect(
      ingestXPost({
        url: "https://x.com/unknownfounder/status/9999999999"
      })
    ).rejects.toMatchObject({
      statusCode: 503
    });

    expect(xClientMock.createXClient).not.toHaveBeenCalled();
  });

  it("uses a deterministic mock post for known fixture URLs", async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: "project-1",
      slug: "example-protocol",
      name: "Example Protocol"
    });
    prismaMock.actor.findUnique.mockResolvedValue({
      id: "actor-1",
      handle: "examplefounder",
      project: {
        id: "project-1",
        slug: "example-protocol",
        name: "Example Protocol"
      }
    });
    aiMock.extractClaim.mockResolvedValue({
      verdict: "CLOCKABLE",
      confidence: 0.82,
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday.",
      sourceQuote: "Rewards dashboard ships by Friday.",
      deliverable: "rewards dashboard",
      deadlineText: "by Friday",
      deadlineAt: "2026-04-17T23:59:59.000Z",
      deadlineTimezone: "UTC",
      deadlineConfidence: 0.88,
      deliveryCriteria: [
        "A public rewards dashboard is announced or accessible.",
        "The release is attributable to Example Protocol."
      ],
      nonDeliveryCriteria: [
        "A teaser, waitlist, or vague update without a public rewards dashboard.",
        "A delayed or reframed announcement without delivery."
      ],
      ambiguityNotes: []
    });
    prismaMock.sourcePost.upsert.mockResolvedValue({ id: "source-1" });
    prismaMock.trigger.upsert.mockResolvedValue({ id: "trigger-1" });
    prismaMock.reviewItem.findFirst.mockResolvedValue(null);
    prismaMock.reviewItem.create.mockResolvedValue({ id: "review-2" });

    const { ingestXPost } = await import("../lib/xIngest");
    const result = await ingestXPost({
      url: "https://x.com/examplefounder/status/1234567890",
      projectSlug: "example-protocol",
      actorHandle: "examplefounder"
    });

    expect(result.reviewItemId).toBe("review-2");
    expect(aiMock.extractClaim).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "Rewards dashboard ships by Friday."
      }),
      { mode: "mock" }
    );
  });

  it("reuses the same trigger key when ingesting the same X URL again", async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      id: "project-1",
      slug: "example-protocol",
      name: "Example Protocol"
    });
    prismaMock.actor.findUnique.mockResolvedValue({
      id: "actor-1",
      handle: "examplefounder",
      project: {
        id: "project-1",
        slug: "example-protocol",
        name: "Example Protocol"
      }
    });
    aiMock.extractClaim.mockResolvedValue({
      verdict: "CLOCKABLE",
      confidence: 0.87,
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday.",
      sourceQuote: "Rewards dashboard ships by Friday.",
      deliverable: "rewards dashboard",
      deadlineText: "by Friday",
      deadlineAt: "2026-04-17T23:59:59.000Z",
      deadlineTimezone: "UTC",
      deadlineConfidence: 0.92,
      deliveryCriteria: [
        "A public rewards dashboard is announced or accessible.",
        "The release is attributable to Example Protocol."
      ],
      nonDeliveryCriteria: [
        "A teaser, waitlist, or vague update without a public rewards dashboard.",
        "A delayed or reframed announcement without delivery."
      ],
      ambiguityNotes: []
    });
    prismaMock.sourcePost.upsert.mockResolvedValue({ id: "source-1" });
    prismaMock.trigger.upsert.mockResolvedValue({ id: "trigger-1" });
    prismaMock.reviewItem.findFirst.mockResolvedValue({
      id: "review-existing"
    });
    prismaMock.reviewItem.update.mockResolvedValue({ id: "review-existing" });

    const { ingestXPost } = await import("../lib/xIngest");
    const result = await ingestXPost({
      url: "https://x.com/examplefounder/status/1234567890",
      sourceText: "Rewards dashboard ships by Friday.",
      projectSlug: "example-protocol",
      actorHandle: "examplefounder"
    });

    expect(result.reviewItemId).toBe("review-existing");
    expect(prismaMock.trigger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          platform_platformTriggerPostId: {
            platform: "X",
            platformTriggerPostId: "1234567890"
          }
        }
      })
    );
  });
});
