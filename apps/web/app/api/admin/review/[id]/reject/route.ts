import { NextResponse } from "next/server";

import { AdminAuthError, requireAdmin } from "../../../../../../lib/env";
import {
  ReviewActionError,
  rejectReviewItem
} from "../../../../../../lib/review";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await getFormData(request);
    await requireAdmin(request, formData);
    const { id } = await params;
    const result = await rejectReviewItem(id, formData.get("reason")?.toString());

    const redirectTo = formData.get("redirectTo")?.toString();
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ReviewActionError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
