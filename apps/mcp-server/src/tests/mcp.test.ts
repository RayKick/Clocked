import { describe, expect, it } from "vitest";

import { searchClaimsInputSchema } from "../tools/searchClaims";

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

describe("mcp tools", () => {
  it("validates search claim input defaults", () => {
    expect(searchClaimsInputSchema.parse({}).limit).toBe(20);
  });

  it("requires an MCP API key for production tools requests", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousMcpApiKey = process.env.MCP_API_KEY;
    process.env.NODE_ENV = "production";
    delete process.env.MCP_API_KEY;

    const { handleMcpRequest } = await import("../server");
    const response = await handleMcpRequest(
      new Request("http://localhost:8787/tools", {
        method: "POST",
        body: JSON.stringify({
          tool: "clocked.extract_claim_from_text",
          input: { text: "SDK ships next week." }
        })
      })
    );

    expect(response.status).toBe(401);

    restoreEnv("NODE_ENV", previousNodeEnv);
    restoreEnv("MCP_API_KEY", previousMcpApiKey);
  });
});
