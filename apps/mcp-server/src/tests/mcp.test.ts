import { describe, expect, it } from "vitest";

import { searchClaimsInputSchema } from "../tools/searchClaims";

describe("mcp tools", () => {
  it("validates search claim input defaults", () => {
    expect(searchClaimsInputSchema.parse({}).limit).toBe(20);
  });
});
