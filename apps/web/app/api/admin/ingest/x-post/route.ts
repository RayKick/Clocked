import { NextResponse } from "next/server";

import { AdminAuthError, requireAdmin } from "../../../../../lib/env";
import {
  IngestXPostError,
  ingestXPost,
  ingestXPostInputSchema
} from "../../../../../lib/xIngest";

async function getFormData(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (value != null) {
        params.set(key, String(value));
      }
    }
    return params;
  }

  return request.formData();
}

export async function POST(request: Request) {
  let redirectTo: string | undefined;
  try {
    const formData = await getFormData(request);
    await requireAdmin(request, formData);
    redirectTo = formData.get("redirectTo")?.toString() || undefined;

    const input = ingestXPostInputSchema.parse({
      url: formData.get("url")?.toString(),
      sourceText: formData.get("sourceText")?.toString() || undefined,
      projectSlug: formData.get("projectSlug")?.toString() || undefined,
      actorHandle: formData.get("actorHandle")?.toString() || undefined,
      postedAt: formData.get("postedAt")?.toString() || undefined
    });
    const result = await ingestXPost(input);

    if (redirectTo) {
      const target = new URL(redirectTo, request.url);
      target.searchParams.set("reviewItemId", result.reviewItemId);
      target.searchParams.set("verdict", result.verdict);
      target.searchParams.set("message", result.message);
      if ("normalizedClaim" in result && result.normalizedClaim) {
        target.searchParams.set("normalizedClaim", result.normalizedClaim);
      }
      if ("deadlineAt" in result && result.deadlineAt) {
        target.searchParams.set("deadlineAt", result.deadlineAt);
      }
      if ("reason" in result && result.reason) {
        target.searchParams.set("reason", result.reason);
      }
      return NextResponse.redirect(target);
    }

    return NextResponse.json(result);
  } catch (error) {
    if (redirectTo) {
      const target = new URL(redirectTo, request.url);
      target.searchParams.set(
        "error",
        error instanceof Error ? error.message : "Unexpected error"
      );
      return NextResponse.redirect(target);
    }
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof IngestXPostError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
