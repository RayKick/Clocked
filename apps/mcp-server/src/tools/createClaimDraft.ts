import { extractClaim } from "@clocked/ai";
import { prisma } from "@clocked/db";
import { z } from "zod";

export const createClaimDraftInputSchema = z.object({
  sourceUrl: z.string().url().optional(),
  sourceText: z.string().min(1),
  sourcePostedAt: z.string().datetime().optional(),
  actorHandle: z.string().optional(),
  projectName: z.string().optional()
});

export async function createClaimDraftTool(input: unknown) {
  const parsed = createClaimDraftInputSchema.parse(input);
  const extraction = await extractClaim(
    {
      text: parsed.sourceText,
      sourcePostedAt: parsed.sourcePostedAt,
      sourceAuthorHandle: parsed.actorHandle,
      projectName: parsed.projectName
    },
    { mode: "mock" }
  );

  const reviewItem = await prisma.reviewItem.create({
    data: {
      kind: "CLAIM_CREATE",
      payloadJson: {
        sourceUrl: parsed.sourceUrl,
        sourceText: parsed.sourceText,
        sourcePostedAt: parsed.sourcePostedAt,
        actorHandle: parsed.actorHandle,
        projectName: parsed.projectName,
        verdict: extraction.verdict,
        normalizedClaim: extraction.normalizedClaim,
        sourceQuote: extraction.sourceQuote,
        deliverable: extraction.deliverable,
        deadlineText: extraction.deadlineText,
        deadlineAt: extraction.deadlineAt,
        deadlineTimezone: extraction.deadlineTimezone,
        deadlineConfidence: extraction.deadlineConfidence,
        extractionConfidence: extraction.confidence,
        deliveryCriteria: extraction.deliveryCriteria,
        nonDeliveryCriteria: extraction.nonDeliveryCriteria,
        ambiguityNotes: extraction.ambiguityNotes,
        notClockableReason: extraction.notClockableReason
      },
      reason: "Created from MCP draft tool."
    }
  });

  return {
    reviewItemId: reviewItem.id,
    extraction,
    message: "Created a pending review item. No public claim has been created yet."
  };
}

