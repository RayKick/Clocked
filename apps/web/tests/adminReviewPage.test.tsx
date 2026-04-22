import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: (props: { href: string; className?: string; children: React.ReactNode }) =>
    React.createElement("a", { href: props.href, className: props.className }, props.children)
}));

vi.mock("../lib/data", () => ({
  getAdminReviewItems: vi.fn(async () => [])
}));

describe("admin review page", () => {
  it("shows the dry-run safety banner", async () => {
    const AdminReviewPage = (await import("../app/admin/review/page")).default;
    const html = renderToStaticMarkup(
      await AdminReviewPage({ searchParams: Promise.resolve({}) })
    );

    expect(html).toContain("Dry-run mode: approvals create local records only.");
    expect(html).toContain("Approval does not post externally.");
  });
});
