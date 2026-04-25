import { describe, expect, it } from "vitest";

import {
  getAppBaseUrl,
  getRuntimeSafetyConfig,
  isAdminQueryPasswordAllowed,
  isDemoFallbackEnabled,
  shouldShowSampleRecords,
  shouldRequireAdminPassword
} from "../lib/env";

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

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

  it("does not enable silent demo fallback in hosted production by default", () => {
    const previousVercelEnv = process.env.VERCEL_ENV;
    const previousDemoFallback = process.env.ENABLE_DEMO_FALLBACK;
    const previousSampleRecords = process.env.SHOW_SAMPLE_RECORDS;
    const previousAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.VERCEL_ENV = "production";
    delete process.env.ENABLE_DEMO_FALLBACK;
    delete process.env.SHOW_SAMPLE_RECORDS;
    delete process.env.ADMIN_PASSWORD;

    expect(isDemoFallbackEnabled()).toBe(false);
    expect(shouldShowSampleRecords()).toBe(false);
    expect(shouldRequireAdminPassword()).toBe(true);

    restoreEnv("VERCEL_ENV", previousVercelEnv);
    restoreEnv("ENABLE_DEMO_FALLBACK", previousDemoFallback);
    restoreEnv("SHOW_SAMPLE_RECORDS", previousSampleRecords);
    restoreEnv("ADMIN_PASSWORD", previousAdminPassword);
  });
});
