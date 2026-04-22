import { describe, expect, it } from "vitest";

import { createHeyAnonClient, shouldUseLiveHeyAnon } from "../src/heyanonClient";

describe("heyanon client", () => {
  it("defaults to mock mode when live calls are disabled", async () => {
    const client = createHeyAnonClient({ enableLiveCalls: false });
    const result = await client.queryProjectContext({
      projectSlug: "solstice",
      prompt: "Give me context",
      sources: [],
      timeframe: {}
    });

    expect(result.summary).toContain("Mocked");
  });

  it("keeps live calls disabled by default", () => {
    expect(shouldUseLiveHeyAnon({ enableLiveCalls: false })).toBe(false);
  });
});
