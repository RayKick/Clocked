import { describe, expect, it } from "vitest";

import { createActorSlug, createClaimSlug, createProjectSlug } from "../src/slugs";

describe("slug helpers", () => {
  it("generates stable project and claim slugs", () => {
    expect(createProjectSlug("Mega Chain")).toBe("mega-chain");
    expect(createClaimSlug("Mega Chain", "Public beta ships by Friday")).toContain(
      "mega-chain-public-beta-ships-by-friday"
    );
  });

  it("normalizes actor slugs", () => {
    expect(createActorSlug("X", "@Founder_Name")).toBe("x-foundername");
  });
});

