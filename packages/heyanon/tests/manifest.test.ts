import { describe, expect, it } from "vitest";

import { createLaunchpadManifest } from "../src/launchpadManifest";
import { createMcpManifest } from "../src/mcpManifest";

describe("manifest helpers", () => {
  it("describes launchpad readiness conservatively", () => {
    const manifest = createLaunchpadManifest();

    expect(manifest.dryRunStatus).toBe(true);
    expect(manifest.surfaces).toContain("admin review");
    expect(manifest.mockedSurfaces).toContain("HeyAnon live calls");
    expect(manifest.safetyPolicy).toContain("SAFE_DRY_RUN=true by default");
  });

  it("lists CLOCKED MCP tools and dry-run defaults", () => {
    const manifest = createMcpManifest();

    expect(manifest.tools).toContain("clocked.search_claims");
    expect(manifest.tools).toContain("clocked.get_claim");
    expect(manifest.tools).toContain("clocked.get_project_record");
    expect(manifest.dryRunDefaults).toEqual({
      safeDryRun: true,
      xPostingEnabled: false,
      heyanonLiveCallsEnabled: false
    });
  });
});
