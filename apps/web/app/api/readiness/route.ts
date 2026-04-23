import { prisma } from "@clocked/db";
import { NextResponse } from "next/server";

import { getRuntimeSafetyConfig } from "../../../lib/env";

export async function GET() {
  const safety = getRuntimeSafetyConfig();
  let database: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  return NextResponse.json({
    ok: database === "ok",
    database,
    safeDryRun: safety.safeDryRun,
    xReadEnabled: safety.xReadEnabled,
    xPostingEnabled: safety.xPostingEnabled,
    heyAnonLiveCallsEnabled: safety.heyAnonLiveCallsEnabled,
    appBaseUrlConfigured: safety.appBaseUrlConfigured,
    adminPasswordConfigured: safety.adminPasswordConfigured,
    timestamp: new Date().toISOString()
  });
}
