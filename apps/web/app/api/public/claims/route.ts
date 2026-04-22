import { NextResponse } from "next/server";

import { getClaims } from "../../../../lib/data";
import { getAppBaseUrl } from "../../../../lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const claims = await getClaims({
    status: searchParams.get("status") ?? undefined,
    projectSlug: searchParams.get("projectSlug") ?? undefined,
    actorHandle: searchParams.get("actorHandle") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    limit: Number(searchParams.get("limit") ?? "50")
  });

  return NextResponse.json({
    claims: claims.map((claim) => ({
      slug: claim.publicSlug,
      projectName: claim.project?.name ?? null,
      actorHandle: claim.actor?.handle ?? null,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null,
      sourceUrl: claim.sourcePost.url,
      publicUrl: `${getAppBaseUrl()}/c/${claim.publicSlug}`
    }))
  });
}
