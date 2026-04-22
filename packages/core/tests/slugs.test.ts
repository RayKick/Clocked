import { describe, expect, it } from "vitest";

import { createActorSlug, createClaimSlug, createProjectSlug } from "../src/slugs";

describe("slug helpers", () => {
  it("generates stable project and claim slugs", () => {
    expect(createProjectSlug("Mega Chain")).toBe("mega-chain");
    expect(createClaimSlug("Mega Chain", "Mega Chain will ship the public beta by Friday.")).toBe(
      "mega-chain-will-ship-public-beta-by-friday"
    );
  });

  it("normalizes actor slugs", () => {
    expect(createActorSlug("X", "@Founder_Name")).toBe("x-foundername");
  });

  it("removes repeated by-by fragments from claim slugs", () => {
    expect(
      createClaimSlug(
        "Example Protocol",
        "Example Protocol rewards release is promised by by Friday."
      )
    ).toBe("example-protocol-rewards-release-is-promised-by-friday");
  });

  it("creates a clean rewards dashboard slug for the ingest demo", () => {
    expect(
      createClaimSlug(
        "Example Protocol",
        "Example Protocol will ship the rewards dashboard by Friday."
      )
    ).toBe("example-protocol-will-ship-rewards-dashboard-by-friday");
  });
});
