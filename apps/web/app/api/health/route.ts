import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "clocked-web",
    safeDryRun: process.env.SAFE_DRY_RUN !== "false"
  });
}

