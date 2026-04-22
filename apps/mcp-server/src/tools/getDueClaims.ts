import { prisma } from "@clocked/db";
import { getAppBaseUrl } from "@clocked/core";
import { z } from "zod";

export const getDueClaimsInputSchema = z.object({
  timeframe: z.enum(["today", "this_week", "next_7_days", "overdue"]),
  projectSlug: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20)
});

export async function getDueClaimsTool(input: unknown) {
  const parsed = getDueClaimsInputSchema.parse(input);
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const claims = await prisma.claim.findMany({
    where: {
      status: "OPEN",
      ...(parsed.projectSlug ? { project: { slug: parsed.projectSlug } } : {}),
      deadlineAt:
        parsed.timeframe === "today"
          ? { lte: todayEnd, gte: now }
          : parsed.timeframe === "overdue"
            ? { lt: now }
            : { gt: now, lte: weekEnd }
    },
    orderBy: { deadlineAt: "asc" },
    take: parsed.limit
  });

  return {
    claims: claims.map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null,
      publicUrl: `${getAppBaseUrl(process.env)}/c/${claim.publicSlug}`
    }))
  };
}
