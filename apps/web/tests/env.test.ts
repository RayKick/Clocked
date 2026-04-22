import { describe, expect, it } from "vitest";

import { getAppBaseUrl } from "../lib/env";

describe("env helpers", () => {
  it("returns a fallback base url", () => {
    expect(getAppBaseUrl()).toContain("http");
  });
});
