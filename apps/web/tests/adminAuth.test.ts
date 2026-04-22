import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  reviewItem: {
    create: vi.fn()
  }
}));

const reviewMock = vi.hoisted(() => ({
  ReviewActionError: class ReviewActionError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  approveReviewItem: vi.fn(),
  rejectReviewItem: vi.fn()
}));

vi.mock("@clocked/db", () => ({
  prisma: prismaMock
}));

vi.mock("../lib/review", () => reviewMock);

const originalEnv = { ...process.env };

describe("admin mutation protection", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.ADMIN_PASSWORD;
    process.env.SAFE_DRY_RUN = "true";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows approve in local dry-run when ADMIN_PASSWORD is empty", async () => {
    reviewMock.approveReviewItem.mockResolvedValue({
      action: "CLAIM_CREATE",
      reviewItemId: "review-1",
      claimId: "claim-1",
      publicSlug: "example-claim",
      botReplyId: "bot-reply-1"
    });

    const { POST } = await import("../app/api/admin/review/[id]/approve/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/review/review-1/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({})
      }),
      { params: Promise.resolve({ id: "review-1" }) }
    );

    expect(response.status).toBe(200);
    expect(reviewMock.approveReviewItem).toHaveBeenCalledWith("review-1");
  });

  it("rejects approve when ADMIN_PASSWORD is configured and missing", async () => {
    process.env.ADMIN_PASSWORD = "secret";

    const { POST } = await import("../app/api/admin/review/[id]/approve/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/review/review-1/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({})
      }),
      { params: Promise.resolve({ id: "review-1" }) }
    );

    expect(response.status).toBe(401);
    expect(reviewMock.approveReviewItem).not.toHaveBeenCalled();
  });

  it("allows approve with x-clocked-admin-password when ADMIN_PASSWORD is configured", async () => {
    process.env.ADMIN_PASSWORD = "secret";
    reviewMock.approveReviewItem.mockResolvedValue({
      action: "BOT_REPLY",
      reviewItemId: "review-2",
      botReplyId: "bot-reply-2",
      status: "APPROVED"
    });

    const { POST } = await import("../app/api/admin/review/[id]/approve/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/review/review-2/approve", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-clocked-admin-password": "secret"
        },
        body: JSON.stringify({})
      }),
      { params: Promise.resolve({ id: "review-2" }) }
    );

    expect(response.status).toBe(200);
    expect(reviewMock.approveReviewItem).toHaveBeenCalledWith("review-2");
  });

  it("rejects reject-route requests when SAFE_DRY_RUN is false without credentials", async () => {
    process.env.SAFE_DRY_RUN = "false";

    const { POST } = await import("../app/api/admin/review/[id]/reject/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/review/review-3/reject", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "Nope" })
      }),
      { params: Promise.resolve({ id: "review-3" }) }
    );

    expect(response.status).toBe(401);
    expect(reviewMock.rejectReviewItem).not.toHaveBeenCalled();
  });

  it("protects admin claim status route when ADMIN_PASSWORD is configured", async () => {
    process.env.ADMIN_PASSWORD = "secret";

    const formData = new FormData();
    formData.set("status", "SLIPPED");
    formData.set("reason", "Deadline passed.");

    const { POST } = await import("../app/api/admin/claims/[id]/status/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/claims/claim-1/status", {
        method: "POST",
        body: formData
      }),
      { params: Promise.resolve({ id: "claim-1" }) }
    );

    expect(response.status).toBe(401);
    expect(prismaMock.reviewItem.create).not.toHaveBeenCalled();
  });
});
