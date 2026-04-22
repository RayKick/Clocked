import {
  EvidenceType,
  ReviewKind,
  type Prisma,
} from "./generated/client/index";
import { prisma } from "./client";

export type EvidenceReviewInput = {
  claimId: string;
  sourcePostId?: string | null;
  evidenceType: EvidenceType;
  url?: string | null;
  summary: string;
  occurredAt?: Date | string | null;
  confidence?: number;
  rawJson?: Prisma.InputJsonValue;
  reason?: string;
};

export async function createEvidenceReviewItem(
  input: EvidenceReviewInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.reviewItem.create({
    data: {
      kind: ReviewKind.EVIDENCE_REVIEW,
      payloadJson: {
        claimId: input.claimId,
        sourcePostId: input.sourcePostId ?? null,
        evidenceType: input.evidenceType,
        url: input.url ?? null,
        summary: input.summary,
        occurredAt:
          input.occurredAt instanceof Date
            ? input.occurredAt.toISOString()
            : input.occurredAt ?? null,
        confidence: input.confidence ?? 0.5,
        rawJson: input.rawJson ?? null,
      },
      reason: input.reason,
    },
  });
}

export async function createEvidenceRecord(
  input: EvidenceReviewInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.evidence.create({
    data: {
      claimId: input.claimId,
      sourcePostId: input.sourcePostId ?? null,
      evidenceType: input.evidenceType,
      url: input.url ?? null,
      summary: input.summary,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : null,
      confidence: input.confidence ?? 0.5,
      rawJson: input.rawJson ?? undefined,
    },
  });
}

export async function getClaimEvidenceTimeline(
  claimId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.evidence.findMany({
    where: { claimId },
    orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
  });
}
