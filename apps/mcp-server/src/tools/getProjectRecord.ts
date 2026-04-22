import {
  countClaimsByStatus,
  factualSummaryForCounts,
  getAppBaseUrl
} from "@clocked/core";
import { prisma } from "@clocked/db";
import { z } from "zod";

export const getProjectRecordInputSchema = z.object({
  projectSlug: z.string().min(1)
});

export async function getProjectRecordTool(input: unknown) {
  const parsed = getProjectRecordInputSchema.parse(input);
  const project = await prisma.project.findUnique({
    where: { slug: parsed.projectSlug },
    include: {
      claims: {
        include: { statusEvents: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!project) {
    throw new Error("Project not found");
  }

  const counts = countClaimsByStatus(project.claims);
  const dueSoon = project.claims.filter(
    (claim) =>
      claim.status === "OPEN" &&
      claim.deadlineAt != null &&
      claim.deadlineAt.getTime() <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime()
  );

  return {
    project: {
      slug: project.slug,
      name: project.name,
      description: project.description,
      officialXHandle: project.officialXHandle
    },
    countsByStatus: counts,
    dueSoon: dueSoon.map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null
    })),
    latestClaims: project.claims.slice(0, 6).map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null
    })),
    latestStatusChanges: project.claims
      .flatMap((claim) => claim.statusEvents)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6)
      .map((event) => ({
        claimId: event.claimId,
        toStatus: event.toStatus,
        reason: event.reason,
        createdAt: event.createdAt.toISOString()
      })),
    publicUrl: `${getAppBaseUrl(process.env)}/p/${project.slug}`,
    factualSummary: factualSummaryForCounts(project.name, counts)
  };
}
