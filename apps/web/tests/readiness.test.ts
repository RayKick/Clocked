import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn()
}));

vi.mock("@clocked/db", () => ({
  prisma: prismaMock
}));

describe("readiness route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns a public-safe readiness payload", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("../app/api/readiness/route");
    const response = await GET();
    const json = await response.json();

    expect(json).toMatchObject({
      ok: true,
      database: "ok",
      safeDryRun: true,
      xReadEnabled: false,
      xPostingEnabled: false,
      heyAnonLiveCallsEnabled: false
    });
    expect(json).not.toHaveProperty("DATABASE_URL");
    expect(json).not.toHaveProperty("ADMIN_PASSWORD");
  });

  it("reports database errors without exposing secrets", async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));

    const { GET } = await import("../app/api/readiness/route");
    const response = await GET();
    const json = await response.json();

    expect(json).toMatchObject({
      ok: false,
      database: "error"
    });
    expect(json).not.toHaveProperty("DATABASE_URL");
  });
});
