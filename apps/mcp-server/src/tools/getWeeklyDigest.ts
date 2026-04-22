import { z } from "zod";
import { prisma } from "@clocked/db";

export const getWeeklyDigestInputSchema = z.object({
  projectSlug: z.string().optional(),
  status: z.string().optional(),
  weekStart: z.string().optional()
});

export async function getWeeklyDigestTool(input: unknown) {
  getWeeklyDigestInputSchema.parse(input);
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [due, delivered, slipped, reframed] = await Promise.all([
    prisma.claim.findMany({
      where: { status: "OPEN", deadlineAt: { gt: now, lte: weekEnd } },
      take: 5
    }),
    prisma.claim.findMany({ where: { status: "DELIVERED" }, take: 5 }),
    prisma.claim.findMany({ where: { status: "SLIPPED" }, take: 5 }),
    prisma.claim.findMany({ where: { status: "REFRAMED" }, take: 5 })
  ]);
  return {
    title: "CLOCKED weekly digest",
    summary: `${due.length} due this week, ${delivered.length} delivered, ${slipped.length} slipped, ${reframed.length} reframed.`,
    claimsDue: due.map((claim) => claim.publicSlug),
    delivered: delivered.map((claim) => claim.publicSlug),
    slipped: slipped.map((claim) => claim.publicSlug),
    reframed: reframed.map((claim) => claim.publicSlug),
    shareText: `CLOCKED weekly digest: ${delivered.length} delivered, ${slipped.length} slipped.`
  };
}
