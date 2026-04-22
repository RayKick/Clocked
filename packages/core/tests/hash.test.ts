import { describe, expect, it } from "vitest";

import { areDuplicateClaims, createCanonicalHash } from "../src/hash";

describe("hash helpers", () => {
  it("creates stable canonical hashes", () => {
    const hash = createCanonicalHash({
      projectSlug: "mega-chain",
      actorHandle: "megachain",
      normalizedClaim: "Public beta ships by Friday",
      deadlineText: "by Friday",
      deliverable: "Public beta"
    });

    expect(hash).toHaveLength(64);
  });

  it("detects duplicates despite whitespace and casing changes", () => {
    expect(
      areDuplicateClaims(
        {
          projectSlug: "mega-chain",
          actorHandle: "megachain",
          normalizedClaim: "Public beta ships by Friday",
          deadlineText: "by Friday",
          deliverable: "Public beta"
        },
        {
          projectSlug: "Mega-Chain",
          actorHandle: "MegaChain",
          normalizedClaim: " public beta ships by friday ",
          deadlineText: "BY FRIDAY",
          deliverable: "PUBLIC BETA"
        }
      )
    ).toBe(true);
  });
});

