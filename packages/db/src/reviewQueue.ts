import {
  ReviewStatus,
  type Prisma,
  type ReviewKind,
} from "./generated/client/index";
import { prisma } from "./client";

export type CreateReviewItemInput = {
  kind: ReviewKind;
  payloadJson: Prisma.InputJsonValue;
  reason?: string;
};

export async function createReviewItem(
  input: CreateReviewItemInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.reviewItem.create({
    data: {
      kind: input.kind,
      payloadJson: input.payloadJson,
      reason: input.reason,
    },
  });
}

export async function approveReviewItem(
  reviewItemId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.reviewItem.update({
    where: { id: reviewItemId },
    data: {
      status: ReviewStatus.APPROVED,
      reviewedAt: new Date(),
    },
  });
}

export async function rejectReviewItem(
  reviewItemId: string,
  reason?: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.reviewItem.update({
    where: { id: reviewItemId },
    data: {
      status: ReviewStatus.REJECTED,
      reason,
      reviewedAt: new Date(),
    },
  });
}

export async function listPendingReviewItems(
  limit = 50,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.reviewItem.findMany({
    where: { status: ReviewStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}
