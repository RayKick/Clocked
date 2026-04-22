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
      "CLOCKED turns time-bounded public promises into trackable claims with deadlines, evidence, and status history."
    );
    expect(html).toContain("Built as a public memory layer for humans on X and agents through MCP.");
    expect(html).toContain("View Example Protocol record");
  });
});
