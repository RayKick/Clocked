import {
  countClaimsByStatus,
  factualSummaryForCounts,
  getAppBaseUrl
} from "@clocked/core";
import { prisma } from "@clocked/db";
import { z } from "zod";

export const getActorRecordInputSchema = z.object({
  platform: z.enum(["X", "TELEGRAM", "DISCORD", "GITHUB", "MANUAL"]),
  handle: z.string().min(1)
});

export async function getActorRecordTool(input: unknown) {
  const parsed = getActorRecordInputSchema.parse(input);
  const actor = await prisma.actor.findUnique({
    where: {
      platform_handle: {
        platform: parsed.platform,
        handle: parsed.handle
      }
    },
    include: {
      project: true,
      claims: {
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!actor) {
    throw new Error("Actor not found");
  }
  const counts = countClaimsByStatus(actor.claims);

  return {
    actor,
    associatedProjects: actor.project ? [actor.project] : [],
    countsByStatus: counts,
    latestClaims: actor.claims.slice(0, 8).map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim
    })),
    publicUrl: `${getAppBaseUrl(process.env)}/a/${actor.platform}/${actor.handle}`,
    factualSummary: factualSummaryForCounts(actor.displayName ?? actor.handle, counts)
  };
}
