import { z } from "zod";
import { prisma } from "@clocked/db";

export const getClaimInputSchema = z.object({
  slug: z.string().min(1)
});

export async function getClaimTool(input: unknown) {
  const parsed = getClaimInputSchema.parse(input);
  const claim = await prisma.claim.findUnique({
    where: { publicSlug: parsed.slug },
    include: {
      sourcePost: true,
      evidences: true,
      statusEvents: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  return {
    slug: claim.publicSlug,
    status: claim.status,
    normalizedClaim: claim.normalizedClaim,
    sourceQuote: claim.sourceQuote,
    sourceUrl: claim.sourcePost.url,
    deadlineText: claim.deadlineText,
    deadlineAt: claim.deadlineAt?.toISOString() ?? null,
    deliveryCriteria: Array.isArray(claim.deliveryCriteriaJson)
      ? claim.deliveryCriteriaJson
      : [],
    nonDeliveryCriteria: Array.isArray(claim.nonDeliveryCriteriaJson)
      ? claim.nonDeliveryCriteriaJson
      : [],
    evidence: claim.evidences.map((evidence) => ({
      evidenceType: evidence.evidenceType,
      summary: evidence.summary,
      url: evidence.url,
      occurredAt: evidence.occurredAt?.toISOString() ?? null,
      confidence: evidence.confidence
    })),
    statusHistory: claim.statusEvents.map((event) => ({
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      reason: event.reason,
      createdAt: event.createdAt.toISOString()
    })),
    publicUrl: `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/c/${claim.publicSlug}`
  };
}
