import { prisma } from "@clocked/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  if (body.claimId) {
    await prisma.reviewItem.create({
      data: {
        kind: "HEYANON_EVIDENCE",
        payloadJson: body,
        reason: "HeyAnon webhook evidence awaiting review."
      }
    });
  }

  return NextResponse.json({ ok: true });
}

