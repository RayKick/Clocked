import { parseDeadlineFromText } from "@clocked/core";
import { createClaimSlug, createProjectSlug } from "@clocked/core";
import { prisma, type Prisma } from "@clocked/db";
import {
  computeClaimCanonicalHash,
  computeSourcePostContentHash
} from "@clocked/db";

const PROJECT_SLUG = "example-protocol";
const PROJECT_NAME = "Example Protocol";
const FOUNDER_HANDLE = "examplefounder";
const PROJECT_HANDLE = "exampleprotocol";
const LEGACY_FIXTURE_REASONS = [
  "Fixture review item: claim create for Example Protocol V2."
];
const LEGACY_FIXTURE_CLAIM_SLUGS = [
  "example-protocol-example-protocol-will-publish-the-public-beta-by",
  "example-protocol-example-protocol-will-ship-v2-next-week",
  "example-protocol-rewards-release-is-promised-by-by-friday"
];
const LEGACY_FIXTURE_NORMALIZED_CLAIMS = [
  "Rewards release is promised by by friday."
];

type FixtureReviewPayload = Record<string, unknown>;

type MarketDemoReceipt = {
  projectSlug: string;
  projectName: string;
  projectDescription: string;
  website: string;
  actorHandle: string;
  actorDisplayName: string;
  sourcePlatformPostId: string;
  sourceUrl: string;
  sourcePostedAt: string;
  sourceText: string;
  normalizedClaim: string;
  sourceQuote: string;
  deliverable: string;
  deadlineText: string;
  deadlineAt: string;
  deadlineConfidence: number;
  extractionConfidence: number;
  status: "OPEN" | "DELIVERED" | "SLIPPED" | "REFRAMED" | "SUPERSEDED" | "AMBIGUOUS";
  deliveryCriteria: string[];
  nonDeliveryCriteria: string[];
  ambiguityNotes?: string[];
  evidence?: {
    sourcePlatformPostId: string;
    sourceUrl: string;
    sourcePostedAt: string;
    sourceText: string;
    summary: string;
    confidence: number;
  };
};

const MARKET_DEMO_RECEIPTS: MarketDemoReceipt[] = [
  {
    projectSlug: "the-graph",
    projectName: "The Graph",
    projectDescription:
      "The Graph is an indexing and data protocol used by crypto applications and agents.",
    website: "https://thegraph.com",
    actorHandle: "graphprotocol",
    actorDisplayName: "The Graph",
    sourcePlatformPostId: "manual-the-graph-roadmap-2026-x402",
    sourceUrl: "https://thegraph.com/blog/technical-roadmap/",
    sourcePostedAt: "2026-02-20T12:00:00.000Z",
    sourceText:
      "The Graph 2026 roadmap lists an x402-compliant Subgraph gateway with MCP and A2A support for Q2 2026.",
    normalizedClaim:
      "The Graph will ship an x402-compliant Subgraph gateway with MCP and A2A support in Q2 2026.",
    sourceQuote:
      "Q2 2026 roadmap item: x402-compliant Subgraph gateway with MCP and A2A support.",
    deliverable: "x402-compliant Subgraph gateway with MCP and A2A support",
    deadlineText: "Q2 2026",
    deadlineAt: "2026-06-30T23:59:59.000Z",
    deadlineConfidence: 0.84,
    extractionConfidence: 0.88,
    status: "OPEN",
    deliveryCriteria: [
      "A public Subgraph gateway update is available or announced.",
      "The update explicitly supports x402, MCP, and A2A."
    ],
    nonDeliveryCriteria: [
      "A roadmap mention without a shipped gateway.",
      "Support for only one of x402, MCP, or A2A."
    ]
  },
  {
    projectSlug: "the-graph",
    projectName: "The Graph",
    projectDescription:
      "The Graph is an indexing and data protocol used by crypto applications and agents.",
    website: "https://thegraph.com",
    actorHandle: "graphprotocol",
    actorDisplayName: "The Graph",
    sourcePlatformPostId: "manual-the-graph-roadmap-2026-tycho",
    sourceUrl: "https://thegraph.com/blog/technical-roadmap/",
    sourcePostedAt: "2026-02-20T12:00:00.000Z",
    sourceText:
      "The Graph 2026 roadmap lists a public beta of Tycho protocol integrations for Q2 2026.",
    normalizedClaim:
      "The Graph will release a public beta of Tycho protocol integrations in Q2 2026.",
    sourceQuote: "Q2 2026 roadmap item: public beta of Tycho protocol integrations.",
    deliverable: "Public beta of Tycho protocol integrations",
    deadlineText: "Q2 2026",
    deadlineAt: "2026-06-30T23:59:59.000Z",
    deadlineConfidence: 0.84,
    extractionConfidence: 0.86,
    status: "OPEN",
    deliveryCriteria: [
      "A public Tycho integration beta is announced or accessible.",
      "The beta is attributable to The Graph."
    ],
    nonDeliveryCriteria: [
      "Private testing only.",
      "A roadmap update without a public beta."
    ]
  },
  {
    projectSlug: "ledger",
    projectName: "Ledger",
    projectDescription:
      "Ledger builds crypto security hardware, software, and transaction-signing infrastructure.",
    website: "https://www.ledger.com",
    actorHandle: "ledger",
    actorDisplayName: "Ledger",
    sourcePlatformPostId: "manual-ledger-ai-roadmap-2026-q2",
    sourceUrl: "https://www.ledger.com/blog-2026-ai-security-roadmap",
    sourcePostedAt: "2026-04-14T12:00:00.000Z",
    sourceText:
      "Ledger's 2026 AI Security Roadmap lists Agent Identity and Agent Skills & CLI for Q2 2026.",
    normalizedClaim:
      "Ledger will ship Agent Identity and Agent Skills & CLI in Q2 2026.",
    sourceQuote: "Q2 2026 roadmap item: Agent Identity and Agent Skills & CLI.",
    deliverable: "Agent Identity and Agent Skills & CLI",
    deadlineText: "Q2 2026",
    deadlineAt: "2026-06-30T23:59:59.000Z",
    deadlineConfidence: 0.84,
    extractionConfidence: 0.9,
    status: "OPEN",
    deliveryCriteria: [
      "Ledger publishes Agent Identity materials or product access.",
      "Ledger publishes Agent Skills & CLI materials or product access."
    ],
    nonDeliveryCriteria: [
      "A future roadmap mention without a shipped or accessible deliverable.",
      "Only one of the two listed Q2 items is available."
    ]
  },
  {
    projectSlug: "ledger",
    projectName: "Ledger",
    projectDescription:
      "Ledger builds crypto security hardware, software, and transaction-signing infrastructure.",
    website: "https://www.ledger.com",
    actorHandle: "ledger",
    actorDisplayName: "Ledger",
    sourcePlatformPostId: "manual-ledger-ai-roadmap-2026-q3",
    sourceUrl: "https://www.ledger.com/blog-2026-ai-security-roadmap",
    sourcePostedAt: "2026-04-14T12:00:00.000Z",
    sourceText:
      "Ledger's 2026 AI Security Roadmap lists Agent Chat marketplace and Agent Intents & Policies for Q3 2026.",
    normalizedClaim:
      "Ledger will ship Agent Chat marketplace and Agent Intents & Policies in Q3 2026.",
    sourceQuote: "Q3 2026 roadmap item: Agent Chat marketplace and Agent Intents & Policies.",
    deliverable: "Agent Chat marketplace and Agent Intents & Policies",
    deadlineText: "Q3 2026",
    deadlineAt: "2026-09-30T23:59:59.000Z",
    deadlineConfidence: 0.84,
    extractionConfidence: 0.88,
    status: "OPEN",
    deliveryCriteria: [
      "Ledger publishes or opens access to Agent Chat marketplace.",
      "Ledger publishes or opens access to Agent Intents & Policies."
    ],
    nonDeliveryCriteria: [
      "A teaser or roadmap refresh without public access.",
      "Only one of the two listed Q3 items is available."
    ]
  },
  {
    projectSlug: "midnight",
    projectName: "Midnight",
    projectDescription:
      "Midnight is a data-protection blockchain focused on privacy-preserving applications.",
    website: "https://midnight.network",
    actorHandle: "midnightntwrk",
    actorDisplayName: "Midnight",
    sourcePlatformPostId: "manual-midnight-mainnet-late-march",
    sourceUrl: "https://midnight.network/blog/",
    sourcePostedAt: "2026-02-26T12:00:00.000Z",
    sourceText:
      "Midnight public materials referenced mainnet launch timing for late March 2026.",
    normalizedClaim: "Midnight will launch mainnet by late March 2026.",
    sourceQuote: "Mainnet launch timing: late March 2026.",
    deliverable: "Mainnet launch",
    deadlineText: "late March 2026",
    deadlineAt: "2026-03-31T23:59:59.000Z",
    deadlineConfidence: 0.78,
    extractionConfidence: 0.82,
    status: "DELIVERED",
    deliveryCriteria: [
      "Midnight announces that mainnet is live.",
      "The announcement is attributable to Midnight or its official materials."
    ],
    nonDeliveryCriteria: [
      "Testnet or developer preview only.",
      "A launch window update without mainnet availability."
    ],
    evidence: {
      sourcePlatformPostId: "manual-midnight-mainnet-delivered",
      sourceUrl: "https://midnight.network/blog/",
      sourcePostedAt: "2026-03-31T12:00:00.000Z",
      sourceText:
        "Midnight published public materials indicating mainnet availability in the late-March window.",
      summary:
        "Official Midnight materials indicated mainnet availability within the recorded late-March window.",
      confidence: 0.82
    }
  }
];

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

export const FIXTURE_IDS = {
  approvedOpenClaimPostId: "fixture-example-clocked-open-post",
  pendingClaimCreatePostId: "fixture-example-pending-claim-create-post",
  notClockablePostId: "fixture-example-not-clockable-post",
  ambiguousPostId: "fixture-example-ambiguous-post",
  deliveredPromisePostId: "fixture-example-delivered-promise-post",
  deliveredProofPostId: "fixture-example-delivered-proof-post",
  reframePostId: "fixture-example-reframe-post",
  triggerPendingClaimCreateId: "fixture-example-pending-claim-create-trigger",
  triggerNotClockableId: "fixture-example-not-clockable-trigger",
  triggerAmbiguousId: "fixture-example-ambiguous-trigger",
  claimCreateReason: "Fixture review item: claim create for Example Protocol updated docs.",
  notClockableReason: "Fixture review item: not clockable Example Protocol source.",
  ambiguousReason: "Fixture review item: ambiguous Example Protocol source.",
  reframeReason: "Fixture review item: Example Protocol reframe candidate.",
  heyanonReason: "Fixture review item: mock HeyAnon evidence for Example Protocol."
} as const;

function assertDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "worker:fixtures requires DATABASE_URL. Start Postgres and copy .env.example to .env before running."
    );
  }
}

function toJsonArray(value: string[]): string[] {
  return [...value];
}

function getClockableDeadline(postedAt: string) {
  const parsed = parseDeadlineFromText("next week", postedAt, "UTC");
  return {
    deadlineText: "next week",
    deadlineAt: parsed.deadlineAt as string,
    deadlineTimezone: parsed.deadlineTimezone ?? "UTC",
    deadlineConfidence: parsed.deadlineConfidence
  };
}

export function buildFixturePayloads() {
  const clockablePostedAt = "2026-04-14T10:00:00.000Z";
  const ambiguousPostedAt = "2026-04-15T12:30:00.000Z";
  const notClockablePostedAt = "2026-04-14T13:00:00.000Z";
  const deliveredPromisePostedAt = "2026-04-01T09:00:00.000Z";
  const deliveredProofPostedAt = "2026-04-18T14:00:00.000Z";
  const reframePostedAt = "2026-04-16T11:00:00.000Z";

  const clockableDeadline = getClockableDeadline(clockablePostedAt);

  return {
    clockablePostedAt,
    pendingClaimCreatePostedAt: "2026-04-16T08:00:00.000Z",
    ambiguousPostedAt,
    notClockablePostedAt,
    deliveredPromisePostedAt,
    deliveredProofPostedAt,
    reframePostedAt,
    approvedOpenClaim: {
      fixtureKey: "example-approved-open-claim",
      sourcePlatform: "X",
      sourcePlatformPostId: FIXTURE_IDS.approvedOpenClaimPostId,
      sourceUrl: `https://x.com/${FOUNDER_HANDLE}/status/${FIXTURE_IDS.approvedOpenClaimPostId}`,
      sourcePostedAt: clockablePostedAt,
      sourceText: "V2 ships next week.",
      actorHandle: FOUNDER_HANDLE,
      projectSlug: PROJECT_SLUG,
      projectName: PROJECT_NAME,
      verdict: "CLOCKABLE",
      normalizedClaim: "Example Protocol will ship V2 next week.",
      sourceQuote: "V2 ships next week.",
      deliverable: "V2",
      deadlineText: clockableDeadline.deadlineText,
      deadlineAt: clockableDeadline.deadlineAt,
      deadlineTimezone: clockableDeadline.deadlineTimezone,
      deadlineConfidence: clockableDeadline.deadlineConfidence,
      extractionConfidence: 0.91,
      deliveryCriteria: toJsonArray([
        "A public V2 release is announced or accessible.",
        "The release is attributable to Example Protocol."
      ]),
      nonDeliveryCriteria: toJsonArray([
        "A teaser, waitlist, or vague update without a public V2 release.",
        "A delayed or reframed announcement without delivery."
      ]),
      ambiguityNotes: []
    } satisfies FixtureReviewPayload,
    pendingClaimCreateReviewPayload: {
      fixtureKey: "example-pending-claim-create",
      sourcePlatform: "X",
      sourcePlatformPostId: FIXTURE_IDS.pendingClaimCreatePostId,
      sourceUrl: `https://x.com/${FOUNDER_HANDLE}/status/${FIXTURE_IDS.pendingClaimCreatePostId}`,
      sourcePostedAt: "2026-04-16T08:00:00.000Z",
      sourceText: "Updated docs ship by Friday.",
      actorHandle: FOUNDER_HANDLE,
      projectSlug: PROJECT_SLUG,
      projectName: PROJECT_NAME,
      verdict: "CLOCKABLE",
      normalizedClaim: "Example Protocol will publish updated docs by Friday.",
      sourceQuote: "Updated docs ship by Friday.",
      deliverable: "Updated docs",
      deadlineText: "by Friday",
      deadlineAt: "2026-04-17T23:59:59.000Z",
      deadlineTimezone: "UTC",
      deadlineConfidence: 0.88,
      extractionConfidence: 0.9,
      deliveryCriteria: toJsonArray([
        "Updated public docs are published or linked.",
        "The docs are attributable to Example Protocol."
      ]),
      nonDeliveryCriteria: toJsonArray([
        "A teaser or roadmap note without published docs.",
        "A delay or scope change without the docs being published."
      ]),
      ambiguityNotes: []
    } satisfies FixtureReviewPayload,
    notClockableReviewPayload: {
      fixtureKey: "example-not-clockable-review",
      sourcePlatform: "X",
      sourcePlatformPostId: FIXTURE_IDS.notClockablePostId,
      sourceUrl: `https://x.com/${FOUNDER_HANDLE}/status/${FIXTURE_IDS.notClockablePostId}`,
      sourcePostedAt: notClockablePostedAt,
      sourceText: "Big things coming soon.",
      actorHandle: FOUNDER_HANDLE,
      projectSlug: PROJECT_SLUG,
      projectName: PROJECT_NAME,
      verdict: "NOT_CLOCKABLE",
      sourceQuote: "Big things coming soon.",
      notClockableReason: "Missing concrete deliverable and bounded deadline."
    } satisfies FixtureReviewPayload,
    ambiguousReviewPayload: {
      fixtureKey: "example-needs-review-claim",
      sourcePlatform: "X",
      sourcePlatformPostId: FIXTURE_IDS.ambiguousPostId,
      sourceUrl: `https://x.com/${FOUNDER_HANDLE}/status/${FIXTURE_IDS.ambiguousPostId}`,
      sourcePostedAt: ambiguousPostedAt,
      sourceText: "Beta soon, probably next week.",
      actorHandle: FOUNDER_HANDLE,
      projectSlug: PROJECT_SLUG,
      projectName: PROJECT_NAME,
      verdict: "NEEDS_REVIEW",
      sourceQuote: "Beta soon, probably next week.",
      normalizedClaim: "Example Protocol may ship beta next week.",
      deliverable: "Beta",
      deadlineText: "probably next week",
      deadlineTimezone: "UTC",
      deadlineConfidence: 0.4,
      extractionConfidence: 0.68,
      deliveryCriteria: toJsonArray([
        "A public beta release is announced or accessible.",
        "The beta is attributable to Example Protocol."
      ]),
      nonDeliveryCriteria: toJsonArray([
        "A vague progress update without a public beta release."
      ]),
      ambiguityNotes: toJsonArray([
        "The source mixes vague timing with an approximate deadline.",
        "Human review is required before publishing a claim."
      ])
    } satisfies FixtureReviewPayload,
    deliveredClaim: {
      sourceQuote: "Audit report ships by Friday.",
      normalizedClaim: "Example Protocol will publish its audit report by Friday.",
      deliverable: "Audit report",
      deadlineText: "by Friday",
      deadlineAt: "2026-04-03T23:59:59.000Z",
      deadlineTimezone: "UTC",
      deadlineConfidence: 0.94,
      extractionConfidence: 0.93
    },
    reframeReviewPayload: {
      fixtureKey: "example-reframe-review",
      proposedStatus: "REFRAMED",
      reason:
        "Official follow-up changed the scope from a full V2 launch to a staged preview rollout.",
      rationale:
        "Official follow-up changed the scope from a full V2 launch to a staged preview rollout."
    } satisfies FixtureReviewPayload,
    heyanonEvidencePayload: {
      fixtureKey: "example-heyanon-evidence-review",
      evidenceType: "HEYANON_GEMMA_RESULT",
      summary:
        "Mock HeyAnon and Gemma summary: official sources referenced a staged rollout and linked to public release materials.",
      confidence: 0.74,
      rawJson: {
        mocked: true,
        sources: ["X", "GitHub", "GitBook"],
        note: "Dry-run fixture only. No live HeyAnon or Gemma call was made."
      }
    } satisfies FixtureReviewPayload
  };
}

async function ensureProjectAndActors() {
  const project = await prisma.project.upsert({
    where: { slug: PROJECT_SLUG },
    update: {
      name: PROJECT_NAME,
      description: "Example Protocol is the local CLOCKED dry-run demo project.",
      officialXHandle: PROJECT_HANDLE
    },
    create: {
      slug: PROJECT_SLUG,
      name: PROJECT_NAME,
      description: "Example Protocol is the local CLOCKED dry-run demo project.",
      officialXHandle: PROJECT_HANDLE
    }
  });

  const founder = await prisma.actor.upsert({
    where: {
      platform_handle: {
        platform: "X",
        handle: FOUNDER_HANDLE
      }
    },
    update: {
      displayName: "Example Founder",
      actorType: "FOUNDER",
      verifiedSource: true,
      projectId: project.id
    },
    create: {
      platform: "X",
      handle: FOUNDER_HANDLE,
      displayName: "Example Founder",
      actorType: "FOUNDER",
      verifiedSource: true,
      projectId: project.id
    }
  });

  const projectActor = await prisma.actor.upsert({
    where: {
      platform_handle: {
        platform: "X",
        handle: PROJECT_HANDLE
      }
    },
    update: {
      displayName: PROJECT_NAME,
      actorType: "OFFICIAL_PROJECT",
      verifiedSource: true,
      projectId: project.id
    },
    create: {
      platform: "X",
      handle: PROJECT_HANDLE,
      displayName: PROJECT_NAME,
      actorType: "OFFICIAL_PROJECT",
      verifiedSource: true,
      projectId: project.id
    }
  });

  return { project, founder, projectActor };
}

async function upsertSourcePost(input: {
  platform?: "X" | "MANUAL";
  platformPostId: string;
  authorId: string;
  handle: string;
  text: string;
  postedAt: string;
  url?: string;
  parentPlatformPostId?: string;
}) {
  const url = input.url ?? `https://x.com/${input.handle}/status/${input.platformPostId}`;
  const platform = input.platform ?? "X";
  return prisma.sourcePost.upsert({
    where: {
      platform_platformPostId: {
        platform,
        platformPostId: input.platformPostId
      }
    },
    update: {
      url,
      authorId: input.authorId,
      text: input.text,
      postedAt: new Date(input.postedAt),
      capturedAt: new Date(input.postedAt),
      parentPlatformPostId: input.parentPlatformPostId ?? null,
      rawJson: {
        fixture: true,
        platform,
        platformPostId: input.platformPostId,
        text: input.text
      },
      contentHash: computeSourcePostContentHash({
        platform,
        platformPostId: input.platformPostId,
        url,
        authorHandle: input.handle,
        text: input.text,
        postedAt: input.postedAt
      }),
      sourceConfidence: 0.97
    },
    create: {
      platform,
      platformPostId: input.platformPostId,
      url,
      authorId: input.authorId,
      text: input.text,
      postedAt: new Date(input.postedAt),
      capturedAt: new Date(input.postedAt),
      parentPlatformPostId: input.parentPlatformPostId ?? null,
      rawJson: {
        fixture: true,
        platform,
        platformPostId: input.platformPostId,
        text: input.text
      },
      contentHash: computeSourcePostContentHash({
        platform,
        platformPostId: input.platformPostId,
        url,
        authorHandle: input.handle,
        text: input.text,
        postedAt: input.postedAt
      }),
      sourceConfidence: 0.97
    }
  });
}

async function ensureReviewItem(input: {
  kind:
    | "CLAIM_CREATE"
    | "STATUS_CHANGE"
    | "HEYANON_EVIDENCE";
  reason: string;
  payloadJson: Record<string, unknown>;
}) {
  const existing = await prisma.reviewItem.findFirst({
    where: { kind: input.kind, reason: input.reason },
    orderBy: { createdAt: "desc" }
  });

  if (existing) {
    return prisma.reviewItem.update({
      where: { id: existing.id },
      data: {
        status: "PENDING",
        reviewedAt: null,
        payloadJson: toJsonValue(input.payloadJson),
        reason: input.reason
      }
    });
  }

  return prisma.reviewItem.create({
    data: {
      kind: input.kind,
      status: "PENDING",
      payloadJson: toJsonValue(input.payloadJson),
      reason: input.reason
    }
  });
}

async function ensureTrigger(input: {
  triggerId: string;
  triggerSourcePostId: string;
  targetSourcePostId: string;
  phrase: string;
  requestedByHandle: string;
  status: "REVIEW_CREATED" | "IGNORED";
  error?: string;
}) {
  return prisma.trigger.upsert({
    where: {
      platform_platformTriggerPostId: {
        platform: "X",
        platformTriggerPostId: input.triggerId
      }
    },
    update: {
      triggerSourcePostId: input.triggerSourcePostId,
      targetSourcePostId: input.targetSourcePostId,
      requestedByHandle: input.requestedByHandle,
      phrase: input.phrase,
      status: input.status,
      error: input.error ?? null
    },
    create: {
      platform: "X",
      platformTriggerPostId: input.triggerId,
      triggerSourcePostId: input.triggerSourcePostId,
      targetSourcePostId: input.targetSourcePostId,
      requestedByHandle: input.requestedByHandle,
      phrase: input.phrase,
      status: input.status,
      error: input.error ?? null
    }
  });
}

async function ensureStatusEvent(input: {
  claimId: string;
  fromStatus?: "OPEN" | "DELIVERED" | "SLIPPED" | "REFRAMED" | "SUPERSEDED" | "AMBIGUOUS";
  toStatus: "OPEN" | "DELIVERED" | "SLIPPED" | "REFRAMED" | "SUPERSEDED" | "AMBIGUOUS";
  reason: string;
  actorType: "SYSTEM" | "AI" | "ADMIN";
  evidenceJson?: Record<string, unknown>;
}) {
  const existing = await prisma.statusEvent.findFirst({
    where: {
      claimId: input.claimId,
      toStatus: input.toStatus,
      reason: input.reason
    }
  });

  if (existing) {
    return existing;
  }

  return prisma.statusEvent.create({
    data: {
      claimId: input.claimId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      reason: input.reason,
      actorType: input.actorType,
      evidenceJson: input.evidenceJson ? toJsonValue(input.evidenceJson) : undefined
    }
  });
}

async function ensureEvidence(input: {
  claimId: string;
  sourcePostId?: string;
  evidenceType:
    | "SOURCE"
    | "FOLLOW_UP"
    | "DELIVERY_PROOF"
    | "REFRAME"
    | "SUPERSEDING_CLAIM"
    | "MANUAL_NOTE"
    | "HEYANON_GEMMA_RESULT"
    | "GITHUB_ACTIVITY"
    | "GITBOOK_CHANGE"
    | "COMMUNITY_SIGNAL";
  summary: string;
  occurredAt?: string;
  url?: string;
  confidence: number;
  rawJson?: Record<string, unknown>;
}) {
  const existing = await prisma.evidence.findFirst({
    where: {
      claimId: input.claimId,
      evidenceType: input.evidenceType,
      summary: input.summary
    }
  });

  if (existing) {
    return prisma.evidence.update({
      where: { id: existing.id },
      data: {
        sourcePostId: input.sourcePostId ?? null,
        url: input.url ?? null,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : null,
        confidence: input.confidence,
        rawJson: input.rawJson ? toJsonValue(input.rawJson) : undefined
      }
    });
  }

  return prisma.evidence.create({
    data: {
      claimId: input.claimId,
      sourcePostId: input.sourcePostId ?? null,
      evidenceType: input.evidenceType,
      url: input.url ?? null,
      summary: input.summary,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : null,
      confidence: input.confidence,
      rawJson: input.rawJson ? toJsonValue(input.rawJson) : undefined
    }
  });
}

async function cleanupLegacyFixtures() {
  await prisma.reviewItem.deleteMany({
    where: {
      reason: {
        in: LEGACY_FIXTURE_REASONS
      }
    }
  });

  const legacyClaims = await prisma.claim.findMany({
    where: {
      OR: [
        {
          publicSlug: {
            in: LEGACY_FIXTURE_CLAIM_SLUGS
          }
        },
        {
          normalizedClaim: {
            in: LEGACY_FIXTURE_NORMALIZED_CLAIMS
          }
        }
      ]
    },
    select: { id: true }
  });

  if (legacyClaims.length === 0) {
    return;
  }

  const claimIds = legacyClaims.map((claim) => claim.id);
  await prisma.statusEvent.deleteMany({ where: { claimId: { in: claimIds } } });
  await prisma.evidence.deleteMany({ where: { claimId: { in: claimIds } } });
  await prisma.botReply.deleteMany({ where: { claimId: { in: claimIds } } });
  await prisma.heyAnonQuery.deleteMany({ where: { claimId: { in: claimIds } } });
  await prisma.claim.deleteMany({ where: { id: { in: claimIds } } });
}

type EnsureClaimInput = {
  publicSlug: string;
  sourcePostId: string;
  canonicalHash: string;
  projectId: string;
  actorId: string;
  status: "OPEN" | "DELIVERED" | "SLIPPED" | "REFRAMED" | "SUPERSEDED" | "AMBIGUOUS";
  normalizedClaim: string;
  sourceQuote: string;
  deliverable: string;
  deadlineText: string;
  deadlineAt: string;
  deadlineTimezone: string;
  deadlineConfidence: number;
  extractionConfidence: number;
  deliveryCriteriaJson: string[];
  nonDeliveryCriteriaJson: string[];
  ambiguityNotesJson: string[];
  relatedClaimIdsJson: string[];
  heyAnonContextJson: Prisma.InputJsonValue;
};

async function ensureClaim(input: EnsureClaimInput) {
  const existing = await prisma.claim.findFirst({
    where: {
      sourcePostId: input.sourcePostId,
      canonicalHash: input.canonicalHash
    }
  });

  const data = {
    publicSlug: input.publicSlug,
    projectId: input.projectId,
    actorId: input.actorId,
    sourcePostId: input.sourcePostId,
    canonicalHash: input.canonicalHash,
    status: input.status,
    normalizedClaim: input.normalizedClaim,
    sourceQuote: input.sourceQuote,
    deliverable: input.deliverable,
    deadlineText: input.deadlineText,
    deadlineAt: new Date(input.deadlineAt),
    deadlineTimezone: input.deadlineTimezone,
    deadlineConfidence: input.deadlineConfidence,
    extractionConfidence: input.extractionConfidence,
    deliveryCriteriaJson: input.deliveryCriteriaJson,
    nonDeliveryCriteriaJson: input.nonDeliveryCriteriaJson,
    ambiguityNotesJson: input.ambiguityNotesJson,
    relatedClaimIdsJson: input.relatedClaimIdsJson,
    heyAnonContextJson: input.heyAnonContextJson
  };

  if (existing) {
    return prisma.claim.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.claim.create({
    data
  });
}

async function ensureMarketDemoReceipts() {
  const createdClaims: string[] = [];

  for (const receipt of MARKET_DEMO_RECEIPTS) {
    const project = await prisma.project.upsert({
      where: { slug: receipt.projectSlug },
      update: {
        name: receipt.projectName,
        description: receipt.projectDescription,
        website: receipt.website,
        officialXHandle: receipt.actorHandle
      },
      create: {
        slug: receipt.projectSlug,
        name: receipt.projectName,
        description: receipt.projectDescription,
        website: receipt.website,
        officialXHandle: receipt.actorHandle
      }
    });

    const actor = await prisma.actor.upsert({
      where: {
        platform_handle: {
          platform: "X",
          handle: receipt.actorHandle
        }
      },
      update: {
        displayName: receipt.actorDisplayName,
        actorType: "OFFICIAL_PROJECT",
        verifiedSource: true,
        projectId: project.id
      },
      create: {
        platform: "X",
        handle: receipt.actorHandle,
        displayName: receipt.actorDisplayName,
        actorType: "OFFICIAL_PROJECT",
        verifiedSource: true,
        projectId: project.id
      }
    });

    const sourcePost = await upsertSourcePost({
      platform: "MANUAL",
      platformPostId: receipt.sourcePlatformPostId,
      authorId: actor.id,
      handle: actor.handle,
      text: receipt.sourceText,
      postedAt: receipt.sourcePostedAt,
      url: receipt.sourceUrl
    });

    const publicSlug = createClaimSlug(receipt.projectName, receipt.normalizedClaim);
    const canonicalHash = computeClaimCanonicalHash({
      actorId: actor.id,
      projectId: project.id,
      normalizedClaim: receipt.normalizedClaim,
      deliverable: receipt.deliverable,
      deadlineText: receipt.deadlineText,
      deadlineAt: receipt.deadlineAt,
      sourcePostId: sourcePost.id
    });

    const claim = await ensureClaim({
      publicSlug,
      projectId: project.id,
      actorId: actor.id,
      sourcePostId: sourcePost.id,
      canonicalHash,
      status: receipt.status,
      normalizedClaim: receipt.normalizedClaim,
      sourceQuote: receipt.sourceQuote,
      deliverable: receipt.deliverable,
      deadlineText: receipt.deadlineText,
      deadlineAt: receipt.deadlineAt,
      deadlineTimezone: "UTC",
      deadlineConfidence: receipt.deadlineConfidence,
      extractionConfidence: receipt.extractionConfidence,
      deliveryCriteriaJson: receipt.deliveryCriteria,
      nonDeliveryCriteriaJson: receipt.nonDeliveryCriteria,
      ambiguityNotesJson: receipt.ambiguityNotes ?? [],
      relatedClaimIdsJson: [],
      heyAnonContextJson: {
        mocked: true,
        source: "marketDemoFixture",
        sourceUrl: receipt.sourceUrl
      }
    });

    await ensureStatusEvent({
      claimId: claim.id,
      toStatus: "OPEN",
      reason: "Market demo receipt captured from public roadmap material.",
      actorType: "ADMIN",
      evidenceJson: {
        sourceUrl: receipt.sourceUrl
      }
    });

    if (receipt.status !== "OPEN") {
      await ensureStatusEvent({
        claimId: claim.id,
        fromStatus: "OPEN",
        toStatus: receipt.status,
        reason: `Market demo receipt marked ${receipt.status.toLowerCase()} from public follow-up material.`,
        actorType: "ADMIN",
        evidenceJson: {
          sourceUrl: receipt.evidence?.sourceUrl ?? receipt.sourceUrl
        }
      });
    }

    await ensureEvidence({
      claimId: claim.id,
      sourcePostId: sourcePost.id,
      evidenceType: "SOURCE",
      url: receipt.sourceUrl,
      summary: "Source roadmap material captured for the demo receipt.",
      occurredAt: receipt.sourcePostedAt,
      confidence: receipt.extractionConfidence,
      rawJson: {
        fixture: true,
        source: "marketDemoFixture",
        sourceUrl: receipt.sourceUrl
      }
    });

    if (receipt.evidence) {
      const evidenceSource = await upsertSourcePost({
        platform: "MANUAL",
        platformPostId: receipt.evidence.sourcePlatformPostId,
        authorId: actor.id,
        handle: actor.handle,
        text: receipt.evidence.sourceText,
        postedAt: receipt.evidence.sourcePostedAt,
        url: receipt.evidence.sourceUrl,
        parentPlatformPostId: receipt.sourcePlatformPostId
      });

      await ensureEvidence({
        claimId: claim.id,
        sourcePostId: evidenceSource.id,
        evidenceType: "DELIVERY_PROOF",
        url: receipt.evidence.sourceUrl,
        summary: receipt.evidence.summary,
        occurredAt: receipt.evidence.sourcePostedAt,
        confidence: receipt.evidence.confidence,
        rawJson: {
          fixture: true,
          source: "marketDemoFixture",
          sourceUrl: receipt.evidence.sourceUrl
        }
      });
    }

    createdClaims.push(claim.publicSlug);
  }

  return createdClaims;
}

export async function runFixtureWorker() {
  assertDatabaseConfigured();
  await cleanupLegacyFixtures();

  const { project, founder, projectActor } = await ensureProjectAndActors();
  const payloads = buildFixturePayloads();

  const clockableSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.approvedOpenClaimPostId,
    authorId: founder.id,
    handle: founder.handle,
    text: "V2 ships next week.",
    postedAt: payloads.clockablePostedAt
  });
  const pendingClaimCreateSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.pendingClaimCreatePostId,
    authorId: founder.id,
    handle: founder.handle,
    text: "Updated docs ship by Friday.",
    postedAt: payloads.pendingClaimCreatePostedAt
  });
  const notClockableSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.notClockablePostId,
    authorId: founder.id,
    handle: founder.handle,
    text: "Big things coming soon.",
    postedAt: payloads.notClockablePostedAt
  });
  const ambiguousSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.ambiguousPostId,
    authorId: founder.id,
    handle: founder.handle,
    text: "Beta soon, probably next week.",
    postedAt: payloads.ambiguousPostedAt
  });
  const deliveredPromiseSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.deliveredPromisePostId,
    authorId: projectActor.id,
    handle: projectActor.handle,
    text: "Audit report ships by Friday.",
    postedAt: payloads.deliveredPromisePostedAt
  });
  const deliveredProofSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.deliveredProofPostId,
    authorId: projectActor.id,
    handle: projectActor.handle,
    text: "The audit report is now live with the full PDF and summary thread.",
    postedAt: payloads.deliveredProofPostedAt,
    parentPlatformPostId: FIXTURE_IDS.deliveredPromisePostId
  });
  const reframeSource = await upsertSourcePost({
    platformPostId: FIXTURE_IDS.reframePostId,
    authorId: projectActor.id,
    handle: projectActor.handle,
    text: "We are moving the V2 launch into a staged preview rollout first.",
    postedAt: payloads.reframePostedAt,
    parentPlatformPostId: FIXTURE_IDS.approvedOpenClaimPostId
  });

  await ensureTrigger({
    triggerId: FIXTURE_IDS.triggerPendingClaimCreateId,
    triggerSourcePostId: pendingClaimCreateSource.id,
    targetSourcePostId: pendingClaimCreateSource.id,
    phrase: "clock this",
    requestedByHandle: "fixturewatch",
    status: "REVIEW_CREATED"
  });
  await ensureTrigger({
    triggerId: FIXTURE_IDS.triggerNotClockableId,
    triggerSourcePostId: notClockableSource.id,
    targetSourcePostId: notClockableSource.id,
    phrase: "clocked",
    requestedByHandle: "fixturewatch",
    status: "IGNORED",
    error: "Missing concrete deliverable and bounded deadline."
  });
  await ensureTrigger({
    triggerId: FIXTURE_IDS.triggerAmbiguousId,
    triggerSourcePostId: ambiguousSource.id,
    targetSourcePostId: ambiguousSource.id,
    phrase: "clock it",
    requestedByHandle: "fixturewatch",
    status: "REVIEW_CREATED"
  });

  const openClaimSlug = createClaimSlug(
    PROJECT_NAME,
    String(payloads.approvedOpenClaim.normalizedClaim)
  );
  const openClaimCanonicalHash = computeClaimCanonicalHash({
    actorId: founder.id,
    projectId: project.id,
    normalizedClaim: String(payloads.approvedOpenClaim.normalizedClaim),
    deliverable: String(payloads.approvedOpenClaim.deliverable),
    deadlineText: String(payloads.approvedOpenClaim.deadlineText),
    deadlineAt: String(payloads.approvedOpenClaim.deadlineAt),
    sourcePostId: clockableSource.id
  });
  const openClaim = await ensureClaim({
    publicSlug: openClaimSlug,
    projectId: project.id,
    actorId: founder.id,
    sourcePostId: clockableSource.id,
    canonicalHash: openClaimCanonicalHash,
    status: "OPEN",
    normalizedClaim: String(payloads.approvedOpenClaim.normalizedClaim),
    sourceQuote: String(payloads.approvedOpenClaim.sourceQuote),
    deliverable: String(payloads.approvedOpenClaim.deliverable),
    deadlineText: String(payloads.approvedOpenClaim.deadlineText),
    deadlineAt: String(payloads.approvedOpenClaim.deadlineAt),
    deadlineTimezone: String(payloads.approvedOpenClaim.deadlineTimezone),
    deadlineConfidence: Number(payloads.approvedOpenClaim.deadlineConfidence),
    extractionConfidence: Number(payloads.approvedOpenClaim.extractionConfidence),
    deliveryCriteriaJson: toJsonArray(payloads.approvedOpenClaim.deliveryCriteria),
    nonDeliveryCriteriaJson: toJsonArray(payloads.approvedOpenClaim.nonDeliveryCriteria),
    ambiguityNotesJson: [],
    relatedClaimIdsJson: [],
    heyAnonContextJson: {
      mocked: true,
      source: "fixtureWorker"
    }
  });

  await ensureStatusEvent({
    claimId: openClaim.id,
    toStatus: "OPEN",
    reason: "Fixture-approved public receipt for Example Protocol V2.",
    actorType: "ADMIN"
  });

  await ensureReviewItem({
    kind: "CLAIM_CREATE",
    reason: FIXTURE_IDS.claimCreateReason,
    payloadJson: {
      ...payloads.pendingClaimCreateReviewPayload,
      projectId: project.id,
      actorId: founder.id,
      sourcePostId: pendingClaimCreateSource.id,
      triggerId: (await prisma.trigger.findUnique({
        where: {
          platform_platformTriggerPostId: {
            platform: "X",
            platformTriggerPostId: FIXTURE_IDS.triggerPendingClaimCreateId
          }
        }
      }))?.id
    }
  });
  await ensureReviewItem({
    kind: "CLAIM_CREATE",
    reason: FIXTURE_IDS.notClockableReason,
    payloadJson: {
      ...payloads.notClockableReviewPayload,
      projectId: project.id,
      actorId: founder.id,
      sourcePostId: notClockableSource.id
    }
  });
  await ensureReviewItem({
    kind: "CLAIM_CREATE",
    reason: FIXTURE_IDS.ambiguousReason,
    payloadJson: {
      ...payloads.ambiguousReviewPayload,
      projectId: project.id,
      actorId: founder.id,
      sourcePostId: ambiguousSource.id
    }
  });

  const deliveredSlug = createClaimSlug(PROJECT_NAME, payloads.deliveredClaim.normalizedClaim);
  const deliveredCanonicalHash = computeClaimCanonicalHash({
    actorId: projectActor.id,
    projectId: project.id,
    normalizedClaim: payloads.deliveredClaim.normalizedClaim,
    deliverable: payloads.deliveredClaim.deliverable,
    deadlineText: payloads.deliveredClaim.deadlineText,
    deadlineAt: payloads.deliveredClaim.deadlineAt,
    sourcePostId: deliveredPromiseSource.id
  });
  const deliveredClaim = await ensureClaim({
    publicSlug: deliveredSlug,
    projectId: project.id,
    actorId: projectActor.id,
    sourcePostId: deliveredPromiseSource.id,
    canonicalHash: deliveredCanonicalHash,
    status: "DELIVERED",
    normalizedClaim: payloads.deliveredClaim.normalizedClaim,
    sourceQuote: payloads.deliveredClaim.sourceQuote,
    deliverable: payloads.deliveredClaim.deliverable,
    deadlineText: payloads.deliveredClaim.deadlineText,
    deadlineAt: payloads.deliveredClaim.deadlineAt,
    deadlineTimezone: payloads.deliveredClaim.deadlineTimezone,
    deadlineConfidence: payloads.deliveredClaim.deadlineConfidence,
    extractionConfidence: payloads.deliveredClaim.extractionConfidence,
    deliveryCriteriaJson: [
      "The public audit report is published or linked.",
      "The report is attributable to Example Protocol."
    ],
    nonDeliveryCriteriaJson: [
      "A teaser or summary thread without the audit report itself.",
      "A delay or scope change without the report being published."
    ],
    ambiguityNotesJson: [],
    relatedClaimIdsJson: [],
    heyAnonContextJson: {
      mocked: true,
      source: "fixtureWorker"
    }
  });

  await ensureEvidence({
    claimId: deliveredClaim.id,
    sourcePostId: deliveredProofSource.id,
    evidenceType: "DELIVERY_PROOF",
    url: deliveredProofSource.url ?? undefined,
    summary: "Official account published the audit report link before the recorded deadline.",
    occurredAt: payloads.deliveredProofPostedAt,
    confidence: 0.96,
    rawJson: {
      fixture: true,
      sourcePostId: deliveredProofSource.id
    }
  });

  await ensureStatusEvent({
    claimId: deliveredClaim.id,
    toStatus: "OPEN",
    reason: "Original audit report claim captured for Example Protocol.",
    actorType: "ADMIN"
  });
  await ensureStatusEvent({
    claimId: deliveredClaim.id,
    fromStatus: "OPEN",
    toStatus: "DELIVERED",
    reason: "The audit report was published before the recorded deadline.",
    actorType: "ADMIN",
    evidenceJson: {
      sourcePostId: deliveredProofSource.id
    }
  });

  await ensureReviewItem({
    kind: "STATUS_CHANGE",
    reason: FIXTURE_IDS.reframeReason,
    payloadJson: {
      ...payloads.reframeReviewPayload,
      claimId: openClaim.id,
      sourcePostId: reframeSource.id
    }
  });
  await ensureReviewItem({
    kind: "HEYANON_EVIDENCE",
    reason: FIXTURE_IDS.heyanonReason,
    payloadJson: {
      ...payloads.heyanonEvidencePayload,
      claimId: deliveredClaim.id,
      sourcePostId: reframeSource.id
    }
  });

  const marketDemoClaimSlugs = await ensureMarketDemoReceipts();

  return {
    ok: true,
    projectSlug: createProjectSlug(PROJECT_NAME),
    approvedOpenClaimSlug: openClaim.publicSlug,
    claimDraftSlug: createClaimSlug(
      PROJECT_NAME,
      String(payloads.pendingClaimCreateReviewPayload.normalizedClaim)
    ),
    deliveredClaimSlug: deliveredClaim.publicSlug,
    reviewItems: {
      claimCreate: FIXTURE_IDS.claimCreateReason,
      notClockable: FIXTURE_IDS.notClockableReason,
      ambiguous: FIXTURE_IDS.ambiguousReason,
      statusChange: FIXTURE_IDS.reframeReason,
      heyanonEvidence: FIXTURE_IDS.heyanonReason
    },
    marketDemoClaimSlugs
  };
}
