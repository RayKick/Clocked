import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: (props: { href: string; className?: string; children: React.ReactNode }) =>
    React.createElement("a", { href: props.href, className: props.className }, props.children)
}));

vi.mock("../lib/data", () => ({
  getClaims: vi.fn(async () => [])
}));

describe("home page", () => {
  it("contains the key product copy", async () => {
    const HomePage = (await import("../app/page")).default;
    const html = renderToStaticMarkup(
      await HomePage({ searchParams: Promise.resolve({}) })
    );

    expect(html).toContain("Public receipts for crypto promises.");
    expect(html).toContain(
      "Capture the claim, preserve the source, attach the deadline, and publish"
    );
    expect(html).toContain("REC-2026-000124");
    expect(html).toContain("From public claim to durable receipt");
    expect(html).toContain("MCP and HUD are first-class surfaces");
  });
});
