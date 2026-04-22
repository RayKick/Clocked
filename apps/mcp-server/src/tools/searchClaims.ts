import { z } from "zod";
import { prisma } from "@clocked/db";

export const searchClaimsInputSchema = z.object({
  query: z.string().optional(),
  projectSlug: z.string().optional(),
  actorHandle: z.string().optional(),
  status: z
    .enum(["OPEN", "DELIVERED", "SLIPPED", "REFRAMED", "SUPERSEDED", "AMBIGUOUS"])
    .optional(),
  dueBefore: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).default(20)
});

export async function searchClaimsTool(input: unknown) {
  const parsed = searchClaimsInputSchema.parse(input);
  const claims = await prisma.claim.findMany({
    where: {
      ...(parsed.projectSlug ? { project: { slug: parsed.projectSlug } } : {}),
      ...(parsed.actorHandle ? { actor: { handle: parsed.actorHandle } } : {}),
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.dueBefore ? { deadlineAt: { lte: new Date(parsed.dueBefore) } } : {}),
      ...(parsed.query
        ? {
            OR: [
              { normalizedClaim: { contains: parsed.query, mode: "insensitive" } },
              { project: { name: { contains: parsed.query, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: { project: true, actor: true, sourcePost: true },
    orderBy: { createdAt: "desc" },
    take: parsed.limit
  });

  return {
    claims: claims.map((claim) => ({
      slug: claim.publicSlug,
      projectName: claim.project?.name ?? null,
      actorHandle: claim.actor?.handle ?? null,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null,
      sourceUrl: claim.sourcePost.url,
      publicUrl: `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/c/${claim.publicSlug}`
    }))
  };
}

