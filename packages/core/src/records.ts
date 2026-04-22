import type { ClaimStatus } from "./statuses";
import type { CountsByStatus, ProjectRecordClaim } from "./types";

export function createEmptyCounts(): CountsByStatus {
  return {
    OPEN: 0,
    DELIVERED: 0,
    SLIPPED: 0,
    REFRAMED: 0,
    SUPERSEDED: 0,
    AMBIGUOUS: 0
  };
}

export function countClaimsByStatus(
  claims: Array<Pick<ProjectRecordClaim, "status">>
): CountsByStatus {
  return claims.reduce<CountsByStatus>((counts, claim) => {
    counts[claim.status] += 1;
    return counts;
  }, createEmptyCounts());
}

export function dueSoonClaims(
  claims: ProjectRecordClaim[],
  now: Date = new Date(),
  days = 7
): ProjectRecordClaim[] {
  const max = now.getTime() + days * 24 * 60 * 60 * 1000;

  return claims.filter((claim) => {
    if (claim.status !== "OPEN" || !claim.deadlineAt) {
      return false;
    }

    const time = claim.deadlineAt.getTime();
    return time >= now.getTime() && time <= max;
  });
}

export function latestClaims(
  claims: ProjectRecordClaim[],
  limit = 5
): ProjectRecordClaim[] {
  return [...claims]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function factualSummaryForCounts(
  projectName: string,
  counts: CountsByStatus
): string {
  return [
    `${projectName} has ${counts.OPEN} open claims`,
    `${counts.DELIVERED} delivered`,
    `${counts.SLIPPED} slipped`,
    `${counts.REFRAMED} reframed`,
    `${counts.AMBIGUOUS} ambiguous`
  ].join(", ");
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function buildRecordCopy(counts: CountsByStatus): string {
  return `${pluralize(counts.OPEN, "open claim")}, ${pluralize(counts.DELIVERED, "delivered claim")}, and ${pluralize(counts.SLIPPED, "slipped claim")} in the public record.`;
}

export function buildHudExport(input: {
  projectSlug: string;
  projectName: string;
  claims: ProjectRecordClaim[];
  baseUrl: string;
}): {
  projectSlug: string;
  projectName: string;
  openClaims: number;
  dueSoonClaims: number;
  deliveredCount: number;
  slippedCount: number;
  reframedCount: number;
  latestClaim: { slug: string; status: ClaimStatus; claim: string } | null;
  latestStatusChange: { toStatus: ClaimStatus; at: string } | null;
  publicRecordUrl: string;
  recordCopy: string;
  riskCopy: string;
} {
  const counts = countClaimsByStatus(input.claims);
  const latest = latestClaims(input.claims, 1)[0];
  const latestStatusChange = input.claims
    .flatMap((claim) => claim.statusEvents)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const recordCopy = buildRecordCopy(counts);

  return {
    projectSlug: input.projectSlug,
    projectName: input.projectName,
    openClaims: counts.OPEN,
    dueSoonClaims: dueSoonClaims(input.claims).length,
    deliveredCount: counts.DELIVERED,
    slippedCount: counts.SLIPPED,
    reframedCount: counts.REFRAMED,
    latestClaim: latest
      ? {
          slug: latest.publicSlug,
          status: latest.status,
          claim: latest.normalizedClaim
        }
      : null,
    latestStatusChange: latestStatusChange
      ? {
          toStatus: latestStatusChange.toStatus,
          at: latestStatusChange.createdAt.toISOString()
        }
      : null,
    publicRecordUrl: `${input.baseUrl.replace(/\/$/, "")}/p/${input.projectSlug}`,
    recordCopy,
    riskCopy: recordCopy
  };
}
