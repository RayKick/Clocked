import { describe, expect, it } from "vitest";

import { MockHeyAnonClient } from "../src/mockHeyAnonClient";

describe("mock heyanon", () => {
  it("returns mocked project context", async () => {
    const client = new MockHeyAnonClient();
    const result = await client.queryProjectContext({
      projectSlug: "example-protocol",
      prompt: "Collect public project context.",
      sources: [],
      timeframe: {}
    });

    expect(result.summary).toContain("Mocked project context");
  });
});
