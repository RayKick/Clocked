import { prisma } from "@clocked/db";
import { NextResponse } from "next/server";

import { AdminAuthError, requireAdmin } from "../../../../../../lib/env";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await request.formData();
    await requireAdmin(request, formData);
    const { id } = await params;
    await prisma.reviewItem.create({
      data: {
        kind: "STATUS_CHANGE",
        payloadJson: {
          claimId: id,
          proposedStatus: formData.get("status")?.toString(),
          rationale: formData.get("reason")?.toString()
        },
        reason: "Admin requested a reviewed status change."
      }
    });

    const redirectTo = formData.get("redirectTo")?.toString();
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
