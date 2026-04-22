import { NextResponse } from "next/server";

import { getProjectRecordBySlug } from "../../../../../../lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const record = await getProjectRecordBySlug(slug);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      slug: record.project.slug,
      name: record.project.name,
      description: record.project.description,
      officialXHandle: record.project.officialXHandle
    },
    countsByStatus: record.countsByStatus,
    dueSoon: record.dueSoon.map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null
    })),
    latestClaims: record.latestClaims.map((claim) => ({
      slug: claim.publicSlug,
      status: claim.status,
      normalizedClaim: claim.normalizedClaim,
      deadlineAt: claim.deadlineAt?.toISOString() ?? null
    })),
    latestStatusChanges: record.latestStatusChanges.map((event) => ({
      claimId: event.claimId,
      toStatus: event.toStatus,
      reason: event.reason,
      createdAt: event.createdAt.toISOString()
    })),
    publicUrl: record.publicUrl,
    factualSummary: record.factualSummary
  });
}
