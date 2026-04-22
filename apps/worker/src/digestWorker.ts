import { prisma } from "@clocked/db";

export async function runDigestWorker() {
  const [delivered, slipped] = await Promise.all([
    prisma.claim.findMany({
      where: { status: "DELIVERED" },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.claim.findMany({
      where: { status: "SLIPPED" },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);
  return {
    title: "CLOCKED weekly digest",
    summary: `${delivered.length} delivered, ${slipped.length} slipped.`,
    delivered: delivered.map((claim) => claim.publicSlug),
    slipped: slipped.map((claim) => claim.publicSlug)
  };
}
