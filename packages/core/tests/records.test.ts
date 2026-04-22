import { describe, expect, it } from "vitest";

import { buildHudExport, countClaimsByStatus } from "../src/records";
import type { ProjectRecordClaim } from "../src/types";

const claim = (overrides: Partial<ProjectRecordClaim>): ProjectRecordClaim => ({
  id: "claim-1",
  publicSlug: "mega-chain-beta",
  projectId: "project-1",
  actorId: "actor-1",
  sourcePostId: "source-1",
  canonicalHash: "hash",
  status: "OPEN",
  normalizedClaim: "Public beta ships by Friday",
  sourceQuote: "Public beta ships by Friday",
  deliverable: "Public beta",
  deadlineText: "by Friday",
  deadlineAt: new Date("2026-04-24T23:59:59.000Z"),
  deadlineTimezone: "UTC",
  deadlineConfidence: 0.72,
  extractionConfidence: 0.9,
  deliveryCriteriaJson: ["Public beta available"],
  nonDeliveryCriteriaJson: ["No beta link"],
  ambiguityNotesJson: [],
  relatedClaimIdsJson: [],
  heyAnonContextJson: null,
  createdAt: new Date("2026-04-22T10:00:00.000Z"),
  updatedAt: new Date("2026-04-22T10:00:00.000Z"),
  project: {
    id: "project-1",
    slug: "mega-chain",
    name: "Mega Chain",
    description: null,
    website: null,
    officialXHandle: null,
    officialTelegram: null,
    officialDiscord: null,
    gitHubOrg: null,
    gitBookUrl: null,
    heyAnonProjectKey: null,
    launchpadAgentId: null,
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z")
  },
  actor: {
    id: "actor-1",
    platform: "X",
    handle: "megachain",
    displayName: "Mega Chain",
    platformUserId: null,
    actorType: "OFFICIAL_PROJECT",
    projectId: "project-1",
    verifiedSource: true,
    createdAt: new Date("2026-04-22T10:00:00.000Z"),
    updatedAt: new Date("2026-04-22T10:00:00.000Z")
  },
  sourcePost: {
    id: "source-1",
    platform: "X",
    url: "https://x.com/megachain/status/1",
    text: "Public beta ships by Friday",
    postedAt: new Date("2026-04-22T10:00:00.000Z"),
    capturedAt: new Date("2026-04-22T10:00:00.000Z"),
    contentHash: "source-hash",
    sourceConfidence: 0.99
  },
  evidence: [],
  statusEvents: [],
  ...overrides
});

describe("records", () => {
  it("aggregates counts by status", () => {
    const counts = countClaimsByStatus([
      claim({ status: "OPEN" }),
      claim({ id: "2", status: "DELIVERED" }),
      claim({ id: "3", status: "SLIPPED" })
    ]);

    expect(counts.OPEN).toBe(1);
    expect(counts.DELIVERED).toBe(1);
    expect(counts.SLIPPED).toBe(1);
  });

  it("builds a compact HUD payload", () => {
    const payload = buildHudExport({
      projectSlug: "mega-chain",
      projectName: "Mega Chain",
      claims: [
        claim({ status: "OPEN" }),
        claim({
          id: "2",
          status: "SLIPPED",
          statusEvents: [
            {
              id: "event-1",
              claimId: "2",
              fromStatus: "OPEN",
              toStatus: "SLIPPED",
              reason: "Deadline passed without public delivery proof.",
              evidenceJson: null,
              actorType: "ADMIN",
              createdAt: new Date("2026-04-23T10:00:00.000Z")
            }
          ]
        })
      ],
      baseUrl: "http://localhost:3000"
    });

    expect(payload.projectSlug).toBe("mega-chain");
    expect(payload.slippedCount).toBe(1);
    expect(payload.publicRecordUrl).toBe("http://localhost:3000/p/mega-chain");
    expect(payload.recordCopy).toBe(
      "1 open claim, 0 delivered claims, and 1 slipped claim in the public record."
    );
    expect(payload.riskCopy).toBe(payload.recordCopy);
  });
});
