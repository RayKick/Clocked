import { prisma } from "@clocked/db";
import { z } from "zod";

export const submitEvidenceInputSchema = z.object({
  claimSlug: z.string().min(1),
  evidenceUrl: z.string().url().optional(),
  evidenceText: z.string().optional(),
  submitter: z.string().optional()
});

export async function submitEvidenceTool(input: unknown) {
  const parsed = submitEvidenceInputSchema.parse(input);
  const claim = await prisma.claim.findUnique({
    where: { publicSlug: parsed.claimSlug }
  });
  if (!claim) {
    throw new Error("Claim not found");
  }

  const reviewItem = await prisma.reviewItem.create({
    data: {
      kind: "EVIDENCE_REVIEW",
      payloadJson: {
        claimId: claim.id,
        evidenceType: "MANUAL_NOTE",
        url: parsed.evidenceUrl,
        summary: parsed.evidenceText ?? `Evidence submitted by ${parsed.submitter ?? "anonymous"}.`
      },
      reason: "Evidence submitted through MCP tool."
    }
  });

  return {
    reviewItemId: reviewItem.id,
    message: "Evidence submitted for review."
  };
}

