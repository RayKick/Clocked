import { describe, expect, it } from "vitest";

import {
  getAppBaseUrl,
  getRuntimeSafetyConfig,
  isAdminQueryPasswordAllowed
} from "../lib/env";

describe("env helpers", () => {
  it("returns a fallback base url", () => {
    expect(getAppBaseUrl()).toContain("http");
  });

  it("uses safe defaults for staging-sensitive flags", () => {
    delete process.env.ALLOW_ADMIN_QUERY_PASSWORD;
    delete process.env.X_READ_ENABLED;
    delete process.env.X_POSTING_ENABLED;
    delete process.env.HEYANON_ENABLE_LIVE_CALLS;

    expect(isAdminQueryPasswordAllowed()).toBe(false);
    expect(getRuntimeSafetyConfig()).toMatchObject({
      xReadEnabled: false,
      xPostingEnabled: false,
      heyAnonLiveCallsEnabled: false,
      allowAdminQueryPassword: false
    });
  });
});
