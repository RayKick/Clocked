import { describe, expect, it } from "vitest";

import { getAppBaseUrl, getMcpBaseUrl, getWebBaseUrl } from "../src/urls";

describe("url helpers", () => {
  it("prefers APP_BASE_URL for public URLs", () => {
    expect(getAppBaseUrl({ APP_BASE_URL: "http://localhost:3001/" })).toBe(
      "http://localhost:3001"
    );
  });

  it("prefers WEB_BASE_URL for local web smoke", () => {
    expect(
      getWebBaseUrl({
        WEB_BASE_URL: "http://localhost:3002/",
        APP_BASE_URL: "http://localhost:3001"
      })
    ).toBe("http://localhost:3002");
  });

  it("prefers MCP_BASE_URL for MCP smoke", () => {
    expect(
      getMcpBaseUrl({
        MCP_BASE_URL: "http://localhost:8788/",
        CLOCKED_MCP_BASE_URL: "http://localhost:8787"
      })
    ).toBe("http://localhost:8788");
  });
});
