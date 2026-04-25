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

    expect(html).toContain("When crypto says");
    expect(html).toContain(
      "Tag @ClockedBot under a public promise"
    );
    expect(html).toContain("REC-2026-000124");
    expect(html).toContain("How CLOCKED works");
    expect(html).toContain("Built for agents");
    expect(html).toContain("CLOCKED is not a dunk bot");
    expect(html).toContain("href=\"/projects\"");
    expect(html).toContain("href=\"/api\"");
    expect(html).not.toContain("148");
    expect(html).not.toContain("href=\"/p/atlas-labs\"");
    expect(html).not.toContain("href=\"/api/hud/project/atlas-labs\"");
  });
});
