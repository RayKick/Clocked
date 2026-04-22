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
  "example-protocol-example-protocol-will-publish-the-public-beta-by"
];

type FixtureReviewPayload = Record<string, unknown>;

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
  platformPostId: string;
  authorId: string;
  handle: string;
  text: string;
  postedAt: string;
  url?: string;
  parentPlatformPostId?: string;
}) {
  const url = input.url ?? `https://x.com/${input.handle}/status/${input.platformPostId}`;
  return prisma.sourcePost.upsert({
    where: {
      platform_platformPostId: {
        platform: "X",
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
        platformPostId: input.platformPostId,
        text: input.text
      },
      contentHash: computeSourcePostContentHash({
        platform: "X",
        platformPostId: input.platformPostId,
        url,
        authorHandle: input.handle,
        text: input.text,
        postedAt: input.postedAt
      }),
      sourceConfidence: 0.97
    },
    create: {
      platform: "X",
      platformPostId: input.platformPostId,
      url,
      authorId: input.authorId,
      text: input.text,
      postedAt: new Date(input.postedAt),
      capturedAt: new Date(input.postedAt),
      parentPlatformPostId: input.parentPlatformPostId ?? null,
      rawJson: {
        fixture: true,
        platformPostId: input.platformPostId,
        text: input.text
      },
      contentHash: computeSourcePostContentHash({
        platform: "X",
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
      publicSlug: {
        in: LEGACY_FIXTURE_CLAIM_SLUGS
      }
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
  const openClaim = await prisma.claim.upsert({
    where: { publicSlug: openClaimSlug },
    update: {
      projectId: project.id,
      actorId: founder.id,
      sourcePostId: clockableSource.id,
      status: "OPEN",
      normalizedClaim: String(payloads.approvedOpenClaim.normalizedClaim),
      sourceQuote: String(payloads.approvedOpenClaim.sourceQuote),
      deliverable: String(payloads.approvedOpenClaim.deliverable),
      deadlineText: String(payloads.approvedOpenClaim.deadlineText),
      deadlineAt: new Date(String(payloads.approvedOpenClaim.deadlineAt)),
      deadlineTimezone: String(payloads.approvedOpenClaim.deadlineTimezone),
      deadlineConfidence: Number(payloads.approvedOpenClaim.deadlineConfidence),
      extractionConfidence: Number(payloads.approvedOpenClaim.extractionConfidence),
      deliveryCriteriaJson: toJsonArray(
        payloads.approvedOpenClaim.deliveryCriteria
      ),
      nonDeliveryCriteriaJson: toJsonArray(
        payloads.approvedOpenClaim.nonDeliveryCriteria
      ),
      ambiguityNotesJson: [],
      relatedClaimIdsJson: [],
      heyAnonContextJson: {
        mocked: true,
        source: "fixtureWorker"
      }
    },
    create: {
      publicSlug: openClaimSlug,
      projectId: project.id,
      actorId: founder.id,
      sourcePostId: clockableSource.id,
      canonicalHash: computeClaimCanonicalHash({
        actorId: founder.id,
        projectId: project.id,
        normalizedClaim: String(payloads.approvedOpenClaim.normalizedClaim),
        deliverable: String(payloads.approvedOpenClaim.deliverable),
        deadlineText: String(payloads.approvedOpenClaim.deadlineText),
        deadlineAt: String(payloads.approvedOpenClaim.deadlineAt),
        sourcePostId: clockableSource.id
      }),
      status: "OPEN",
      normalizedClaim: String(payloads.approvedOpenClaim.normalizedClaim),
      sourceQuote: String(payloads.approvedOpenClaim.sourceQuote),
      deliverable: String(payloads.approvedOpenClaim.deliverable),
      deadlineText: String(payloads.approvedOpenClaim.deadlineText),
      deadlineAt: new Date(String(payloads.approvedOpenClaim.deadlineAt)),
      deadlineTimezone: String(payloads.approvedOpenClaim.deadlineTimezone),
      deadlineConfidence: Number(payloads.approvedOpenClaim.deadlineConfidence),
      extractionConfidence: Number(payloads.approvedOpenClaim.extractionConfidence),
      deliveryCriteriaJson: toJsonArray(
        payloads.approvedOpenClaim.deliveryCriteria
      ),
      nonDeliveryCriteriaJson: toJsonArray(
        payloads.approvedOpenClaim.nonDeliveryCriteria
      ),
      ambiguityNotesJson: [],
      relatedClaimIdsJson: [],
      heyAnonContextJson: {
        mocked: true,
        source: "fixtureWorker"
      }
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
  const deliveredClaim = await prisma.claim.upsert({
    where: { publicSlug: deliveredSlug },
    update: {
      projectId: project.id,
      actorId: projectActor.id,
      sourcePostId: deliveredPromiseSource.id,
      status: "DELIVERED",
      normalizedClaim: payloads.deliveredClaim.normalizedClaim,
      sourceQuote: payloads.deliveredClaim.sourceQuote,
      deliverable: payloads.deliveredClaim.deliverable,
      deadlineText: payloads.deliveredClaim.deadlineText,
      deadlineAt: new Date(payloads.deliveredClaim.deadlineAt),
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
    },
    create: {
      publicSlug: deliveredSlug,
      projectId: project.id,
      actorId: projectActor.id,
      sourcePostId: deliveredPromiseSource.id,
      canonicalHash: computeClaimCanonicalHash({
        actorId: projectActor.id,
        projectId: project.id,
        normalizedClaim: payloads.deliveredClaim.normalizedClaim,
        deliverable: payloads.deliveredClaim.deliverable,
        deadlineText: payloads.deliveredClaim.deadlineText,
        deadlineAt: payloads.deliveredClaim.deadlineAt,
        sourcePostId: deliveredPromiseSource.id
      }),
      status: "DELIVERED",
      normalizedClaim: payloads.deliveredClaim.normalizedClaim,
      sourceQuote: payloads.deliveredClaim.sourceQuote,
      deliverable: payloads.deliveredClaim.deliverable,
      deadlineText: payloads.deliveredClaim.deadlineText,
      deadlineAt: new Date(payloads.deliveredClaim.deadlineAt),
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
    }
  };
}
