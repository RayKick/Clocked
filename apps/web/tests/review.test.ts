import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const tx = {
    project: { findUnique: vi.fn(), upsert: vi.fn() },
    actor: { findUnique: vi.fn(), upsert: vi.fn() },
    sourcePost: { findUnique: vi.fn(), upsert: vi.fn(), create: vi.fn() },
    claim: { upsert: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    statusEvent: { findFirst: vi.fn(), create: vi.fn() },
    botReply: { findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    evidence: { create: vi.fn() },
    reviewItem: { findUnique: vi.fn(), update: vi.fn() }
  };

  return {
    ...tx,
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    ReviewKind: {
      CLAIM_CREATE: "CLAIM_CREATE",
      STATUS_CHANGE: "STATUS_CHANGE",
      HEYANON_EVIDENCE: "HEYANON_EVIDENCE",
      EVIDENCE_REVIEW: "EVIDENCE_REVIEW",
      BOT_REPLY: "BOT_REPLY",
      CLAIM_STITCH: "CLAIM_STITCH"
    }
  };
});

vi.mock("@clocked/db", () => ({
  prisma: prismaMock,
  ReviewKind: prismaMock.ReviewKind
}));

describe("review actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it(
    "approves CLAIM_CREATE into an open claim and draft bot reply",
    async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue({
      id: "review-1",
      kind: "CLAIM_CREATE",
      status: "PENDING",
      payloadJson: {
        verdict: "CLOCKABLE",
        projectName: "Example Protocol",
        actorHandle: "examplefounder",
        normalizedClaim: "Example Protocol will ship V2 next week.",
        sourceQuote: "V2 ships next week.",
        deliverable: "V2",
        deadlineText: "next week",
        deadlineAt: "2026-04-20T23:59:59.000Z",
        deadlineConfidence: 0.65,
        extractionConfidence: 0.91,
        deliveryCriteria: ["A public V2 release is announced or accessible."],
        nonDeliveryCriteria: ["A teaser or vague update without public release."]
      }
    });
    prismaMock.project.upsert.mockResolvedValue({ id: "project-1", slug: "example-protocol", name: "Example Protocol" });
    prismaMock.actor.upsert.mockResolvedValue({ id: "actor-1", handle: "examplefounder" });
    prismaMock.sourcePost.create.mockResolvedValue({ id: "source-1" });
    prismaMock.claim.upsert.mockResolvedValue({ id: "claim-1", publicSlug: "example-protocol-example-protocol-will-ship-v2-next-week", normalizedClaim: "Example Protocol will ship V2 next week.", deadlineText: "next week" });
    prismaMock.statusEvent.findFirst.mockResolvedValue(null);
    prismaMock.statusEvent.create.mockResolvedValue({ id: "status-event-1" });
    prismaMock.botReply.findFirst.mockResolvedValue(null);
    prismaMock.botReply.create.mockResolvedValue({ id: "bot-reply-1" });
    prismaMock.reviewItem.update.mockResolvedValue({ id: "review-1" });

    const { approveReviewItem } = await import("../lib/review");
    const result = await approveReviewItem("review-1");

    expect(result).toEqual({
      action: "CLAIM_CREATE",
      reviewItemId: "review-1",
      claimId: "claim-1",
      publicSlug: "example-protocol-example-protocol-will-ship-v2-next-week",
      botReplyId: "bot-reply-1"
    });
      expect(prismaMock.botReply.create).toHaveBeenCalledOnce();
    },
    10_000
  );

  it("approves BOT_REPLY without posting externally", async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue({
      id: "review-2",
      kind: "BOT_REPLY",
      status: "PENDING",
      payloadJson: { botReplyId: "bot-reply-2" }
    });
    prismaMock.botReply.findUnique.mockResolvedValue({ id: "bot-reply-2", status: "DRAFT" });
    prismaMock.botReply.update.mockResolvedValue({ id: "bot-reply-2", status: "APPROVED" });
    prismaMock.reviewItem.update.mockResolvedValue({ id: "review-2" });

    const { approveReviewItem } = await import("../lib/review");
    const result = await approveReviewItem("review-2");

    expect(result).toEqual({
      action: "BOT_REPLY",
      reviewItemId: "review-2",
      botReplyId: "bot-reply-2",
      status: "APPROVED"
    });
  });

  it("approves STATUS_CHANGE only with a reason", async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue({
      id: "review-3",
      kind: "STATUS_CHANGE",
      status: "PENDING",
      payloadJson: {
        claimId: "claim-3",
        proposedStatus: "SLIPPED",
        reason: "Deadline passed without confirmed public delivery evidence."
      }
    });
    prismaMock.claim.findUnique.mockResolvedValue({ id: "claim-3", status: "OPEN" });
    prismaMock.claim.update.mockResolvedValue({ id: "claim-3", status: "SLIPPED" });
    prismaMock.statusEvent.create.mockResolvedValue({ id: "status-event-3" });
    prismaMock.reviewItem.update.mockResolvedValue({ id: "review-3" });

    const { approveReviewItem } = await import("../lib/review");
    const result = await approveReviewItem("review-3");

    expect(result).toEqual({
      action: "STATUS_CHANGE",
      reviewItemId: "review-3",
      claimId: "claim-3",
      status: "SLIPPED",
      statusEventId: "status-event-3"
    });
  });

  it("approves HEYANON_EVIDENCE into an evidence row without changing status", async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue({
      id: "review-4",
      kind: "HEYANON_EVIDENCE",
      status: "PENDING",
      payloadJson: {
        claimId: "claim-4",
        evidenceType: "HEYANON_GEMMA_RESULT",
        summary: "Mock HeyAnon evidence summary."
      }
    });
    prismaMock.claim.findUnique.mockResolvedValue({ id: "claim-4", status: "OPEN" });
    prismaMock.evidence.create.mockResolvedValue({ id: "evidence-4" });
    prismaMock.reviewItem.update.mockResolvedValue({ id: "review-4" });

    const { approveReviewItem } = await import("../lib/review");
    const result = await approveReviewItem("review-4");

    expect(result).toEqual({
      action: "HEYANON_EVIDENCE",
      reviewItemId: "review-4",
      claimId: "claim-4",
      evidenceId: "evidence-4"
    });
    expect(prismaMock.claim.update).not.toHaveBeenCalled();
  });

  it("rejects a pending review item without creating records", async () => {
    prismaMock.reviewItem.findUnique.mockResolvedValue({
      id: "review-5",
      kind: "CLAIM_CREATE",
      status: "PENDING",
      payloadJson: {}
    });
    prismaMock.reviewItem.update.mockResolvedValue({
      id: "review-5",
      status: "REJECTED",
      reason: "Ambiguous deadline."
    });

    const { rejectReviewItem } = await import("../lib/review");
    const result = await rejectReviewItem("review-5", "Ambiguous deadline.");

    expect(result).toEqual({
      ok: true,
      reviewItemId: "review-5",
      status: "REJECTED",
      reason: "Ambiguous deadline."
    });
    expect(prismaMock.claim.upsert).not.toHaveBeenCalled();
    expect(prismaMock.evidence.create).not.toHaveBeenCalled();
    expect(prismaMock.statusEvent.create).not.toHaveBeenCalled();
    expect(prismaMock.botReply.create).not.toHaveBeenCalled();
  });
});
