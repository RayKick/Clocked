import { prisma } from "@clocked/db";
import { NextResponse } from "next/server";

import { requireAdmin } from "../../../../../../lib/env";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const formData = await request.formData();
  await requireAdmin(request, formData);
  const { id } = await params;
  await prisma.reviewItem.create({
    data: {
      kind: "EVIDENCE_REVIEW",
      payloadJson: {
        claimId: id,
        evidenceType: "MANUAL_NOTE",
        summary: formData.get("summary")?.toString(),
        url: formData.get("url")?.toString() || null
      },
      reason: "Admin submitted evidence for review."
    }
  });

  const redirectTo = formData.get("redirectTo")?.toString();
  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return NextResponse.json({ ok: true });
}

