import { describe, expect, it } from "vitest";

import { GET } from "../app/api/health/route";

describe("health route", () => {
  it("returns an ok payload", async () => {
    const response = await GET();
    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.service).toBe("clocked-web");
  });
});

