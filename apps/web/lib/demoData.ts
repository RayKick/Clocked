import type {
  ActorPlatform,
  CountsByStatus,
  ProjectRecordClaim
} from "@clocked/core";
import {
  countClaimsByStatus,
  dueSoonClaims,
  factualSummaryForCounts
} from "@clocked/core";

import { getAppBaseUrl } from "./env";

const now = new Date();
const daysFromNow = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const demoProject = {
  id: "demo-project-atlas",
  slug: "atlas-labs",
  name: "Atlas Labs",
  description:
    "A demo project record showing how CLOCKED preserves time-bounded crypto promises with source, deadline, evidence, and review context.",
  website: "https://example.com",
  officialXHandle: "atlaslabs",
  officialTelegram: null,
  officialDiscord: null,
  gitHubOrg: "atlas-labs",
  gitBookUrl: null,
  heyAnonProjectKey: null,
  launchpadAgentId: null,
  createdAt: daysAgo(90),
  updatedAt: now
};

const demoActor = {
  id: "demo-actor-atlasfounder",
  platform: "X" as const,
  handle: "atlasfounder",
  displayName: "Atlas Labs founder",
  platformUserId: null,
  actorType: "FOUNDER" as const,
  projectId: demoProject.id,
  verifiedSource: true,
  createdAt: daysAgo(90),
  updatedAt: now
};

function demoClaim(input: {
  id: string;
  slug: string;
  status: ProjectRecordClaim["status"];
  claim: string;
  quote: string;
  deliverable: string;
  deadlineText: string;
  deadlineAt: Date;
  createdDaysAgo: number;
  evidence?: string[];
  statusReason: string;
}): ProjectRecordClaim {
  const createdAt = daysAgo(input.createdDaysAgo);

  return {
    id: input.id,
    publicSlug: input.slug,
    projectId: demoProject.id,
    actorId: demoActor.id,
    sourcePostId: `${input.id}-source`,
    canonicalHash: `${input.id}-hash`,
    status: input.status,
    normalizedClaim: input.claim,
    sourceQuote: input.quote,
    deliverable: input.deliverable,
    deadlineText: input.deadlineText,
    deadlineAt: input.deadlineAt,
    deadlineTimezone: "UTC",
    deadlineConfidence: 0.88,
    extractionConfidence: 0.91,
    deliveryCriteriaJson: [
      "Public announcement or shipped artifact is visible from an official source.",
      "Evidence is reviewed before the receipt changes status."
    ],
    nonDeliveryCriteriaJson: [
      "Private messages, vague intent, or unverified community claims are not enough."
    ],
    ambiguityNotesJson: [],
    relatedClaimIdsJson: [],
    heyAnonContextJson: {
      mode: "demo",
      note: "Demo record used when the production database is not configured."
    },
    createdAt,
    updatedAt: now,
    project: demoProject,
    actor: demoActor,
    sourcePost: {
      id: `${input.id}-source`,
      platform: "X",
      url: "https://x.com/",
      text: input.quote,
      postedAt: createdAt,
      capturedAt: createdAt,
      contentHash: `${input.id}-content`,
      sourceConfidence: 0.86
    },
    evidence: (input.evidence ?? []).map((summary, index) => ({
      id: `${input.id}-evidence-${index + 1}`,
      claimId: input.id,
      sourcePostId: `${input.id}-source`,
      evidenceType: index === 0 ? "SOURCE" : "FOLLOW_UP",
      url: "https://example.com",
      summary,
      occurredAt: daysAgo(Math.max(input.createdDaysAgo - index - 1, 0)),
      confidence: 0.82,
      rawJson: null,
      createdAt: daysAgo(Math.max(input.createdDaysAgo - index - 1, 0))
    })),
    statusEvents: [
      {
        id: `${input.id}-status-created`,
        claimId: input.id,
        fromStatus: null,
        toStatus: "OPEN",
        reason: "Claim captured from a public source and queued for reviewed receipt publication.",
        evidenceJson: null,
        actorType: "SYSTEM",
        createdAt
      },
      {
        id: `${input.id}-status-current`,
        claimId: input.id,
        fromStatus: input.status === "OPEN" ? null : "OPEN",
        toStatus: input.status,
        reason: input.statusReason,
        evidenceJson: null,
        actorType: "ADMIN",
        createdAt: daysAgo(1)
      }
    ]
  };
}

export const demoClaims: ProjectRecordClaim[] = [
  demoClaim({
    id: "demo-claim-001",
    slug: "atlas-labs-mainnet-public-beta-by-april-30-2026",
    status: "OPEN",
    claim: "Atlas Labs will open mainnet public beta by 30 Apr 2026.",
    quote: "Public beta opens before the end of April. Receipts, docs, and status page will be public.",
    deliverable: "Public beta availability with official release notes.",
    deadlineText: "30 Apr 2026 23:59 UTC",
    deadlineAt: daysFromNow(5),
    createdDaysAgo: 12,
    evidence: ["Original roadmap post captured with a concrete public beta deadline."],
    statusReason: "The deadline is still active. No delivery assessment has been published yet."
  }),
  demoClaim({
    id: "demo-claim-002",
    slug: "atlas-labs-sdk-v1-before-may-15-2026",
    status: "OPEN",
    claim: "Atlas Labs will publish SDK v1 before 15 May 2026.",
    quote: "SDK v1 is scheduled before 15 May with docs and example integrations.",
    deliverable: "SDK v1 repository, docs, and integration examples.",
    deadlineText: "15 May 2026 23:59 UTC",
    deadlineAt: daysFromNow(20),
    createdDaysAgo: 8,
    evidence: ["Roadmap item captured with deadline and expected artifacts."],
    statusReason: "The deadline has not passed."
  }),
  demoClaim({
    id: "demo-claim-003",
    slug: "atlas-labs-audit-report-published",
    status: "DELIVERED",
    claim: "Atlas Labs will publish the external audit report this month.",
    quote: "The audit report will be public this month, not summarized behind a private form.",
    deliverable: "Public audit report from an external reviewer.",
    deadlineText: "April 2026",
    deadlineAt: daysFromNow(4),
    createdDaysAgo: 18,
    evidence: [
      "Audit report link was added to the public docs.",
      "Release notes reference the same audit artifact."
    ],
    statusReason: "Reviewed public evidence indicates the promised report is available."
  }),
  demoClaim({
    id: "demo-claim-004",
    slug: "atlas-labs-incentive-dashboard-march-deadline",
    status: "SLIPPED",
    claim: "Atlas Labs will launch the incentive dashboard by 31 Mar 2026.",
    quote: "The dashboard ships by the end of March with wallet-level visibility.",
    deliverable: "Public incentive dashboard.",
    deadlineText: "31 Mar 2026 23:59 UTC",
    deadlineAt: daysAgo(25),
    createdDaysAgo: 45,
    evidence: ["No reviewed public dashboard artifact was available at the deadline."],
    statusReason:
      "The recorded deadline passed before qualifying public delivery evidence was reviewed."
  }),
  demoClaim({
    id: "demo-claim-005",
    slug: "atlas-labs-governance-module-scope-update",
    status: "REFRAMED",
    claim: "Atlas Labs will ship the governance module in Q2 2026.",
    quote: "Governance module arrives in Q2, starting with proposal creation and vote tracking.",
    deliverable: "Governance proposal and vote tracking module.",
    deadlineText: "Q2 2026",
    deadlineAt: daysFromNow(66),
    createdDaysAgo: 30,
    evidence: ["Follow-up roadmap narrowed the Q2 scope to read-only vote tracking."],
    statusReason: "A reviewed follow-up changed the scope of the original claim."
  })
];

export function getDemoClaims(filters: {
  status?: string;
  projectSlug?: string;
  actorHandle?: string;
  query?: string;
  limit?: number;
}) {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  return demoClaims
    .filter((claim) => (filters.status ? claim.status === filters.status : true))
    .filter((claim) =>
      filters.projectSlug ? claim.project?.slug === filters.projectSlug : true
    )
    .filter((claim) =>
      filters.actorHandle ? claim.actor?.handle === filters.actorHandle : true
    )
    .filter((claim) =>
      normalizedQuery
        ? [
            claim.normalizedClaim,
            claim.project?.name,
            claim.actor?.handle,
            claim.publicSlug
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedQuery))
        : true
    )
    .slice(0, filters.limit ?? 50);
}

export function getDemoClaimBySlug(slug: string) {
  return demoClaims.find((claim) => claim.publicSlug === slug) ?? null;
}

export function getDemoProjectRecordBySlug(projectSlug: string) {
  if (projectSlug !== demoProject.slug && projectSlug !== "example-protocol") {
    return null;
  }

  const claims = getDemoClaims({ projectSlug: demoProject.slug, limit: 200 });
  const counts = countClaimsByStatus(claims);
  const latestStatusChanges = claims
    .flatMap((claim) => claim.statusEvents)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return {
    project: {
      ...demoProject,
      actors: [demoActor]
    },
    countsByStatus: counts,
    dueSoon: dueSoonClaims(claims),
    openClaims: claims.filter((claim) => claim.status === "OPEN"),
    deliveredClaims: claims.filter((claim) => claim.status === "DELIVERED").slice(0, 6),
    slippedClaims: claims.filter((claim) => claim.status === "SLIPPED").slice(0, 6),
    reframedClaims: claims.filter((claim) => claim.status === "REFRAMED").slice(0, 6),
    latestClaims: claims.slice(0, 6),
    latestStatusChanges,
    publicUrl: `${getAppBaseUrl()}/p/${demoProject.slug}`,
    factualSummary: factualSummaryForCounts(demoProject.name, counts),
    claims
  };
}

export function getDemoActorRecordByHandle(platform: ActorPlatform, handle: string) {
  if (platform !== "X" || !["atlasfounder", "examplefounder"].includes(handle)) {
    return null;
  }

  const claims = getDemoClaims({ actorHandle: demoActor.handle, limit: 200 });
  const counts: CountsByStatus = countClaimsByStatus(claims);

  return {
    actor: demoActor,
    associatedProjects: [demoProject],
    countsByStatus: counts,
    latestStatusChanges: claims
      .flatMap((claim) => claim.statusEvents)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6),
    latestClaims: claims.slice(0, 8),
    publicUrl: `${getAppBaseUrl()}/a/${demoActor.platform}/${demoActor.handle}`,
    factualSummary: factualSummaryForCounts(demoActor.displayName ?? demoActor.handle, counts)
  };
}

export function getDemoDueBuckets() {
  const openClaims = getDemoClaims({ status: "OPEN", limit: 200 });
  const allClaims = getDemoClaims({ limit: 200 });
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);
  const weekEnd = daysFromNow(7);
  const counts = countClaimsByStatus(allClaims);

  return {
    today: openClaims.filter((claim) => claim.deadlineAt && claim.deadlineAt <= todayEnd),
    thisWeek: openClaims.filter(
      (claim) =>
        claim.deadlineAt &&
        claim.deadlineAt > todayEnd &&
        claim.deadlineAt <= weekEnd
    ),
    overdue: openClaims.filter((claim) => claim.deadlineAt && claim.deadlineAt < now),
    recentlyDelivered: allClaims.filter((claim) => claim.status === "DELIVERED").slice(0, 6),
    recentlyReframed: allClaims.filter((claim) => claim.status === "REFRAMED").slice(0, 6),
    digest: `Demo record: ${openClaims.filter(
      (claim) =>
        claim.deadlineAt &&
        claim.deadlineAt >= now &&
        claim.deadlineAt <= weekEnd
    ).length} open claim(s) due soon, ${counts.DELIVERED} delivered, ${counts.SLIPPED} slipped, ${counts.REFRAMED} reframed.`
  };
}
