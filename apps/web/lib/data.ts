import type {
  ActorPlatform,
  ProjectRecordClaim
} from "@clocked/core";
import {
  buildHudExport,
  countClaimsByStatus,
  dueSoonClaims,
  factualSummaryForCounts
} from "@clocked/core";
import { prisma, type Prisma } from "@clocked/db";

import { getAppBaseUrl } from "./env";

const claimInclude = {
  project: true,
  actor: true,
  sourcePost: true,
  evidences: true,
  statusEvents: {
    orderBy: { createdAt: "asc" as const }
  }
};

type ClaimWithInclude = Prisma.ClaimGetPayload<{
  include: typeof claimInclude;
}>;

function mapClaim(claim: NonNullable<ClaimWithInclude>): ProjectRecordClaim {
  return {
    id: claim.id,
    publicSlug: claim.publicSlug,
    projectId: claim.projectId,
    actorId: claim.actorId,
    sourcePostId: claim.sourcePostId,
    canonicalHash: claim.canonicalHash,
    status: claim.status,
    normalizedClaim: claim.normalizedClaim,
    sourceQuote: claim.sourceQuote,
    deliverable: claim.deliverable,
    deadlineText: claim.deadlineText,
    deadlineAt: claim.deadlineAt,
    deadlineTimezone: claim.deadlineTimezone,
    deadlineConfidence: claim.deadlineConfidence,
    extractionConfidence: claim.extractionConfidence,
    deliveryCriteriaJson: Array.isArray(claim.deliveryCriteriaJson)
      ? claim.deliveryCriteriaJson.map(String)
      : [],
    nonDeliveryCriteriaJson: Array.isArray(claim.nonDeliveryCriteriaJson)
      ? claim.nonDeliveryCriteriaJson.map(String)
      : [],
    ambiguityNotesJson: Array.isArray(claim.ambiguityNotesJson)
      ? claim.ambiguityNotesJson.map(String)
      : [],
    relatedClaimIdsJson: Array.isArray(claim.relatedClaimIdsJson)
      ? claim.relatedClaimIdsJson.map(String)
      : [],
    heyAnonContextJson: claim.heyAnonContextJson,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
    project: claim.project,
    actor: claim.actor,
    sourcePost: {
      id: claim.sourcePost.id,
      platform: claim.sourcePost.platform,
      url: claim.sourcePost.url,
      text: claim.sourcePost.text,
      postedAt: claim.sourcePost.postedAt,
      capturedAt: claim.sourcePost.capturedAt,
      contentHash: claim.sourcePost.contentHash,
      sourceConfidence: claim.sourcePost.sourceConfidence
    },
    evidence: claim.evidences.map((evidence) => ({
      id: evidence.id,
      claimId: evidence.claimId,
      sourcePostId: evidence.sourcePostId,
      evidenceType: evidence.evidenceType,
      url: evidence.url,
      summary: evidence.summary,
      occurredAt: evidence.occurredAt,
      confidence: evidence.confidence,
      rawJson: evidence.rawJson,
      createdAt: evidence.createdAt
    })),
    statusEvents: claim.statusEvents.map((event) => ({
      id: event.id,
      claimId: event.claimId,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      reason: event.reason,
      evidenceJson: event.evidenceJson,
      actorType: event.actorType,
      createdAt: event.createdAt
    }))
  };
}

export async function getClaims(filters: {
  status?: string;
  projectSlug?: string;
  actorHandle?: string;
  query?: string;
  limit?: number;
}) {
  const claims = await prisma.claim.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.projectSlug ? { project: { slug: filters.projectSlug } } : {}),
      ...(filters.actorHandle ? { actor: { handle: filters.actorHandle } } : {}),
      ...(filters.query
        ? {
            OR: [
              { normalizedClaim: { contains: filters.query, mode: "insensitive" } },
              { project: { name: { contains: filters.query, mode: "insensitive" } } },
              { actor: { handle: { contains: filters.query, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: claimInclude,
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 50
  });

  return claims.map(mapClaim);
}

export async function getClaimBySlug(slug: string) {
  const claim = await prisma.claim.findUnique({
    where: { publicSlug: slug },
    include: claimInclude
  });

  return claim ? mapClaim(claim) : null;
}

export async function getProjectRecordBySlug(projectSlug: string) {
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    include: {
      actors: true,
      claims: {
        include: claimInclude,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) {
    return null;
  }

  const claims = project.claims.map(mapClaim);
  const counts = countClaimsByStatus(claims);
  const latestStatusChanges = claims
    .flatMap((claim) => claim.statusEvents)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);
  const dueSoon = dueSoonClaims(claims);

  return {
    project,
    countsByStatus: counts,
    dueSoon,
    openClaims: claims.filter((claim) => claim.status === "OPEN"),
    deliveredClaims: claims.filter((claim) => claim.status === "DELIVERED").slice(0, 6),
    slippedClaims: claims.filter((claim) => claim.status === "SLIPPED").slice(0, 6),
    reframedClaims: claims.filter((claim) => claim.status === "REFRAMED").slice(0, 6),
    latestClaims: claims.slice(0, 6),
    latestStatusChanges,
    publicUrl: `${getAppBaseUrl()}/p/${project.slug}`,
    factualSummary: factualSummaryForCounts(project.name, counts),
    claims
  };
}

export async function getActorRecordByHandle(
  platform: ActorPlatform,
  handle: string
) {
  const actor = await prisma.actor.findUnique({
    where: {
      platform_handle: {
        platform,
        handle
      }
    },
    include: {
      project: true,
      claims: {
        include: claimInclude,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!actor) {
    return null;
  }

  const claims = actor.claims.map(mapClaim);
  const counts = countClaimsByStatus(claims);
  return {
    actor,
    associatedProjects: actor.project ? [actor.project] : [],
    countsByStatus: counts,
    latestStatusChanges: claims
      .flatMap((claim) => claim.statusEvents)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6),
    latestClaims: claims.slice(0, 8),
    publicUrl: `${getAppBaseUrl()}/a/${actor.platform}/${actor.handle}`,
    factualSummary: factualSummaryForCounts(actor.displayName ?? actor.handle, counts)
  };
}

export async function getDueBuckets() {
  const [openClaims, allClaims] = await Promise.all([
    getClaims({ status: "OPEN", limit: 200 }),
    getClaims({ limit: 200 })
  ]);
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
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
    digest: `CLOCKED this week: ${openClaims.filter(
      (claim) =>
        claim.deadlineAt &&
        claim.deadlineAt >= now &&
        claim.deadlineAt <= weekEnd
    ).length} open claim(s) due soon, ${counts.DELIVERED} delivered, ${counts.SLIPPED} slipped, ${counts.REFRAMED} reframed.`
  };
}

export async function getAdminReviewItems() {
  return prisma.reviewItem.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }
  });
}

export async function getAdminSummary() {
  const [pendingReviews, openClaims, projects, actors] = await Promise.all([
    prisma.reviewItem.count({ where: { status: "PENDING" } }),
    prisma.claim.count({ where: { status: "OPEN" } }),
    prisma.project.count(),
    prisma.actor.count()
  ]);

  return { pendingReviews, openClaims, projects, actors };
}

export async function getHudPayload(projectSlug: string) {
  const record = await getProjectRecordBySlug(projectSlug);
  if (!record) {
    return null;
  }

  return buildHudExport({
    projectSlug: record.project.slug,
    projectName: record.project.name,
    claims: record.claims,
    baseUrl: getAppBaseUrl()
  });
}
