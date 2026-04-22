import { NextResponse } from "next/server";

import { getHudPayload, getProjectRecordBySlug } from "../../../../../lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const record = await getProjectRecordBySlug(slug);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safePayload = await getHudPayload(slug);
  if (!safePayload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = request.headers.get("x-hud-secret");
  if (process.env.HUD_EXPORT_SECRET && secret === process.env.HUD_EXPORT_SECRET) {
    return NextResponse.json({
      ...safePayload,
      expanded: record
    });
  }

  return NextResponse.json(safePayload);
}
