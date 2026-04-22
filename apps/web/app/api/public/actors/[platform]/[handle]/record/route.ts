import { NextResponse } from "next/server";

import { getActorRecordByHandle } from "../../../../../../../lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ platform: string; handle: string }> }
) {
  const { platform, handle } = await params;
  const record = await getActorRecordByHandle(platform.toUpperCase() as never, handle);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    actor: {
      platform: record.actor.platform,
      handle: record.actor.handle,
      displayName: record.actor.displayName,
      actorType: record.actor.actorType,
      verifiedSource: record.actor.verifiedSource
    },
    associatedProjects: record.associatedProjects.map((project) => ({
      slug: project.slug,
      name: project.name
    })),
    countsByStatus: record.countsByStatus,
    latestClaims: record.latestClaims.map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null
    })),
    publicUrl: record.publicUrl,
    factualSummary: record.factualSummary
  });
}
