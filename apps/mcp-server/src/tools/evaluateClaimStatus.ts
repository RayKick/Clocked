import { evaluateClaimStatus } from "@clocked/ai";
import { prisma } from "@clocked/db";
import { z } from "zod";

export const evaluateClaimStatusInputSchema = z.object({
  claimSlug: z.string().min(1),
  evidenceUrls: z.array(z.string().url()).optional(),
  evidenceText: z.array(z.string()).optional()
});

export async function evaluateClaimStatusTool(input: unknown) {
  const parsed = evaluateClaimStatusInputSchema.parse(input);
  const claim = await prisma.claim.findUnique({
    where: { publicSlug: parsed.claimSlug }
  });
  if (!claim) {
    throw new Error("Claim not found");
  }

  return evaluateClaimStatus(
    {
      claimSlug: parsed.claimSlug,
      normalizedClaim: claim.normalizedClaim,
      sourceQuote: claim.sourceQuote,
      deliverable: claim.deliverable,
      deadlineText: claim.deadlineText,
      deadlineAt: claim.deadlineAt?.toISOString(),
      deliveryCriteria: Array.isArray(claim.deliveryCriteriaJson)
        ? claim.deliveryCriteriaJson.map(String)
        : [],
      nonDeliveryCriteria: Array.isArray(claim.nonDeliveryCriteriaJson)
        ? claim.nonDeliveryCriteriaJson.map(String)
        : [],
      evidenceUrls: parsed.evidenceUrls ?? [],
      evidenceText: parsed.evidenceText ?? []
    },
    { mode: "mock" }
  );
}

