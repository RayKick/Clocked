import { prisma } from "@clocked/db";

export async function runDeadlineWorker() {
  const overdueClaims = await prisma.claim.findMany({
    where: {
      status: "OPEN",
      deadlineAt: { lt: new Date() }
    }
  });

  for (const claim of overdueClaims) {
    const existingReview = await prisma.reviewItem.findFirst({
      where: {
        kind: "STATUS_CHANGE",
        status: "PENDING",
        payloadJson: {
          path: ["claimId"],
          equals: claim.id
        }
      }
    });

    if (existingReview) {
      continue;
    }

    await prisma.reviewItem.create({
      data: {
        kind: "STATUS_CHANGE",
        payloadJson: {
          claimId: claim.id,
          proposedStatus: "SLIPPED",
          rationale:
            "Deadline passed without confirmed public evidence that the delivery criteria were met."
        },
        reason: "Created by deadline worker. Requires human review."
      }
    });
  }

  return { overdueClaims: overdueClaims.length };
}

