import { JobStatus, type JobKind, type Prisma } from "./generated/client/index";
import { prisma } from "./client";

export type EnqueueJobInput = {
  kind: JobKind;
  payloadJson: Prisma.InputJsonValue;
  runAfter?: Date;
};

export async function enqueueJob(
  input: EnqueueJobInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.job.create({
    data: {
      kind: input.kind,
      payloadJson: input.payloadJson,
      runAfter: input.runAfter ?? new Date(),
    },
  });
}

export async function claimNextRunnableJob(
  kind?: JobKind,
) {
  const now = new Date();

  return prisma.$transaction(async (transaction) => {
    const nextJob = await transaction.job.findFirst({
      where: {
        status: JobStatus.QUEUED,
        runAfter: { lte: now },
        ...(kind ? { kind } : {}),
      },
      orderBy: [{ runAfter: "asc" }, { createdAt: "asc" }],
    });

    if (!nextJob) {
      return null;
    }

    const updated = await transaction.job.updateMany({
      where: {
        id: nextJob.id,
        status: JobStatus.QUEUED,
      },
      data: {
        status: JobStatus.RUNNING,
        lockedAt: now,
        attempts: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      return null;
    }

    return transaction.job.findUnique({
      where: { id: nextJob.id },
    });
  });
}

export async function markJobCompleted(
  jobId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.COMPLETED,
      lockedAt: null,
      lastError: null,
    },
  });
}

export async function markJobFailed(
  jobId: string,
  error: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.FAILED,
      lockedAt: null,
      lastError: error,
    },
  });
}

export async function requeueJob(
  jobId: string,
  runAfter: Date,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.QUEUED,
      runAfter,
      lockedAt: null,
    },
  });
}
