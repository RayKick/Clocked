import { prisma } from "./client";
import type {
  Claim,
  Prisma,
  SourcePost,
} from "./generated/client/index";
import {
  computeClaimCanonicalHash,
  computeSourcePostContentHash,
} from "./hashes";

export type ClaimDuplicateLookup = {
  actorId?: string | null;
  projectId?: string | null;
  normalizedClaim: string;
  deliverable: string;
  deadlineAt?: Date | string | null;
  deadlineText: string;
  sourcePostId?: string | null;
};

export type SourcePostDuplicateLookup = {
  platform: string;
  platformPostId?: string | null;
  url?: string | null;
  authorHandle?: string | null;
  text: string;
  postedAt?: Date | string | null;
};

export async function findClaimDuplicates(
  lookup: ClaimDuplicateLookup,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<Claim[]> {
  const canonicalHash = computeClaimCanonicalHash(lookup);

  return tx.claim.findMany({
    where: { canonicalHash },
    orderBy: { createdAt: "asc" },
  });
}

export async function findSourcePostDuplicates(
  lookup: SourcePostDuplicateLookup,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<SourcePost[]> {
  const contentHash = computeSourcePostContentHash(lookup);

  return tx.sourcePost.findMany({
    where: { contentHash },
    orderBy: { createdAt: "asc" },
  });
}

export async function hasDuplicateClaim(
  lookup: ClaimDuplicateLookup,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<boolean> {
  const duplicates = await findClaimDuplicates(lookup, tx);
  return duplicates.length > 0;
}

export async function hasDuplicateSourcePost(
  lookup: SourcePostDuplicateLookup,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<boolean> {
  const duplicates = await findSourcePostDuplicates(lookup, tx);
  return duplicates.length > 0;
}
