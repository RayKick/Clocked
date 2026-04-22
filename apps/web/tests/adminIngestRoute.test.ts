import { z } from "zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ingestMock = vi.hoisted(() => ({
  IngestXPostError: class IngestXPostError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  ingestXPost: vi.fn()
}));

vi.mock("../lib/xIngest", () => ({
  ...ingestMock,
  ingestXPostInputSchema: z.object({
    url: z.string().url(),
    sourceText: z.string().trim().min(1).optional(),
    projectSlug: z.string().trim().min(1).optional(),
    actorHandle: z.string().trim().min(1).optional(),
    postedAt: z.string().datetime().optional()
  })
}));

const originalEnv = { ...process.env };

describe("admin ingest route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv, SAFE_DRY_RUN: "true" };
    delete process.env.ADMIN_PASSWORD;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows local dry-run ingest when ADMIN_PASSWORD is empty", async () => {
    ingestMock.ingestXPost.mockResolvedValue({
      reviewItemId: "review-1",
      verdict: "CLOCKABLE",
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday.",
      deadlineAt: "2026-04-17T23:59:59.000Z",
      message: "Created a pending review item."
    });

    const { POST } = await import("../app/api/admin/ingest/x-post/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/ingest/x-post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: "https://x.com/examplefounder/status/1234567890",
          sourceText: "Rewards dashboard ships by Friday."
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday."
    });
    expect(ingestMock.ingestXPost).toHaveBeenCalledOnce();
  });

  it("requires admin auth when ADMIN_PASSWORD is set", async () => {
    process.env.ADMIN_PASSWORD = "secret";

    const { POST } = await import("../app/api/admin/ingest/x-post/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/ingest/x-post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: "https://x.com/examplefounder/status/1234567890",
          sourceText: "Rewards dashboard ships by Friday."
        })
      })
    );

    expect(response.status).toBe(401);
    expect(ingestMock.ingestXPost).not.toHaveBeenCalled();
  });

  it("rejects query password fallback when ALLOW_ADMIN_QUERY_PASSWORD=false", async () => {
    process.env.ADMIN_PASSWORD = "secret";

    const { POST } = await import("../app/api/admin/ingest/x-post/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/ingest/x-post?adminPassword=secret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: "https://x.com/examplefounder/status/1234567890",
          sourceText: "Rewards dashboard ships by Friday."
        })
      })
    );

    expect(response.status).toBe(401);
    expect(ingestMock.ingestXPost).not.toHaveBeenCalled();
  });

  it("allows header auth when ADMIN_PASSWORD is set", async () => {
    process.env.ADMIN_PASSWORD = "secret";
    ingestMock.ingestXPost.mockResolvedValue({
      reviewItemId: "review-header",
      verdict: "CLOCKABLE",
      normalizedClaim: "Example Protocol will ship the rewards dashboard by Friday.",
      deadlineAt: "2026-04-17T23:59:59.000Z",
      message: "Created a pending review item."
    });

    const { POST } = await import("../app/api/admin/ingest/x-post/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/ingest/x-post", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-clocked-admin-password": "secret"
        },
        body: JSON.stringify({
          url: "https://x.com/examplefounder/status/1234567890",
          sourceText: "Rewards dashboard ships by Friday."
        })
      })
    );

    expect(response.status).toBe(200);
    expect(ingestMock.ingestXPost).toHaveBeenCalledOnce();
  });

  it("rejects invalid ingest payloads", async () => {
    const { POST } = await import("../app/api/admin/ingest/x-post/route");
    const response = await POST(
      new Request("http://localhost:3000/api/admin/ingest/x-post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: "bad-url"
        })
      })
    );

    expect(response.status).toBe(400);
  });
});
