import React from "react";
import Link from "next/link";
import { getPublicStatusLabel } from "@clocked/core";
import { SectionShell, StatusBadge } from "@clocked/ui";

import { ClaimGrid } from "../components/ClaimGrid";
import { PageShell } from "../components/PageShell";
import { getClaims } from "../lib/data";

const tabs = [
  { label: "Open", status: "OPEN" },
  { label: "Delivered", status: "DELIVERED" },
  { label: "Slipped", status: "SLIPPED" },
  { label: "Reframed", status: "REFRAMED" },
  { label: "Ambiguous", status: "AMBIGUOUS" },
  { label: "Due Soon", status: "OPEN", href: "/due" }
];

export const dynamic = "force-dynamic";

function ReceiptHeroVisual() {
  const rows = [
    { label: "Claim", value: "Agent Identity ships", meta: "Public promise" },
    { label: "Source", value: "Official roadmap", meta: "Captured" },
    { label: "Deadline", value: "Q2 2026", meta: "Preserved" },
    { label: "Evidence", value: "Review required", meta: "Before public" },
    { label: "Status", value: "Open", meta: "Neutral label" }
  ];

  return (
    <div className="receipt-visual" aria-label="Stylized public receipt preview">
      <div className="receipt-orbit receipt-orbit--one" aria-hidden="true" />
      <div className="receipt-orbit receipt-orbit--two" aria-hidden="true" />
      <div className="receipt-tag receipt-tag--left">
        <span>Transparent</span>
        <small>Everyone can verify.</small>
      </div>
      <div className="receipt-tag receipt-tag--right">
        <span>Reviewed</span>
        <small>Public after review.</small>
      </div>
      <div className="receipt-tag receipt-tag--bottom">
        <span>Permanent record</span>
        <small>Deadlines stay attached.</small>
      </div>
      <div className="receipt-stage" aria-hidden="true" />
      <div className="receipt-object">
        <div className="receipt-object-top">
          <span className="receipt-logo">✓</span>
          <div>
            <strong>CLOCKED</strong>
            <span>REC-2026-000124</span>
          </div>
        </div>
        <span className="receipt-object-label">Recorded public receipt</span>
        <div className="receipt-object-lines">
          {rows.map((row) => (
            <div key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
              <small>{row.meta}</small>
            </div>
          ))}
        </div>
        <div className="receipt-object-footer">
          <div className="receipt-qr" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <span>Review-gated. Public after approval.</span>
        </div>
      </div>
    </div>
  );
}

function getReceiptId(claim: Awaited<ReturnType<typeof getClaims>>[number] | undefined) {
  return claim ? `Receipt #${claim.id.slice(-6).toUpperCase()}` : "Receipt #000124";
}

function getProjectInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatShortDate(date: Date | string | null | undefined) {
  if (!date) return "Recorded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(date));
}

function FeaturedRecordTable({
  claim,
  secondaryClaim
}: {
  claim: Awaited<ReturnType<typeof getClaims>>[number] | undefined;
  secondaryClaim: Awaited<ReturnType<typeof getClaims>>[number] | undefined;
}) {
  const href = `/c/${claim?.publicSlug ?? "example-protocol-will-ship-v2-next-week"}`;
  const projectName = claim?.project?.name ?? "Ledger";
  const actorHandle = claim?.actor?.handle ?? "ledger";
  const sourceLabel =
    claim?.sourcePost.platform === "MANUAL"
      ? "Official roadmap material"
      : `${claim?.sourcePost.platform ?? "X"} post by @${actorHandle}`;
  const sourceDate = formatShortDate(claim?.sourcePost.postedAt);
  const deadlineDate = formatShortDate(claim?.deadlineAt);
  const evidenceCount = claim?.evidence.length ?? 0;
  const evidenceLabel =
    evidenceCount > 0
      ? `Source plus ${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}`
      : "Source preserved";

  return (
    <section className="featured-receipt reveal-delayed" aria-label="Featured receipt">
      <div className="featured-receipt-head">
        <span className="card-kicker">Featured receipt</span>
        <span className="featured-receipt-id">{getReceiptId(claim)}</span>
      </div>
      <div className="featured-receipt-grid">
        <Link href={href} className="project-identity" aria-label={`${projectName} receipt`}>
          <div className="project-orb">
            <span>{getProjectInitials(projectName)}</span>
          </div>
          <strong>{projectName}</strong>
          <span>@{actorHandle}</span>
          <div className="project-tags" aria-label="Receipt properties">
            <span>Source-linked</span>
            <span>Review-gated</span>
          </div>
        </Link>
        <div className="receipt-table">
          <Link href={href} className="receipt-table-row">
            <span>Claim</span>
            <strong>{claim?.normalizedClaim ?? "Example Protocol will ship V2 next week."}</strong>
          </Link>
          <Link href={href} className="receipt-table-row">
            <span>Source</span>
            <strong>{sourceLabel}</strong>
            <small>{sourceDate}</small>
          </Link>
          <Link href={href} className="receipt-table-row">
            <span>Deadline</span>
            <strong>{claim?.deadlineText ?? "next week"}</strong>
            <small>{deadlineDate}</small>
          </Link>
          <Link href={href} className="receipt-table-row">
            <span>Evidence</span>
            <strong>{evidenceLabel}</strong>
            <small>Evidence remains attached to this receipt.</small>
          </Link>
          <Link href={href} className="receipt-table-row receipt-table-row--status">
            <span>Status</span>
            <StatusBadge status={claim?.status ?? "OPEN"} />
            <small>Neutral status history, no score.</small>
          </Link>
        </div>
      </div>
        {secondaryClaim ? (
          <Link
            href={`/c/${secondaryClaim.publicSlug}`}
            className="receipt-followup-row"
          >
            <span>Next record</span>
            <strong>{secondaryClaim.normalizedClaim}</strong>
            <StatusBadge status={secondaryClaim.status} />
          </Link>
        ) : (
          <div className="receipt-followup-row">
            <span>Next record</span>
            <strong>Example Protocol shipped the prior rewards milestone.</strong>
            <StatusBadge status="DELIVERED" />
          </div>
        )}
    </section>
  );
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const status = typeof params.status === "string" ? params.status : "OPEN";
  const query = typeof params.q === "string" ? params.q : undefined;
  const [claims, allClaims] = await Promise.all([
    getClaims({ status, query, limit: 24 }),
    getClaims({ query, limit: 100 })
  ]);
  const activeTab = tabs.find((tab) => tab.status === status) ?? tabs[0]!;
  const activeLabel =
    activeTab.label === "Due Soon" ? "Due soon" : getPublicStatusLabel(status as never);
  const previewClaim = claims[0] ?? allClaims[0];
  const featuredClaims = claims.slice(0, 2);
  const deliveredCount = allClaims.filter((claim) => claim.status === "DELIVERED").length;
  const slippedCount = allClaims.filter((claim) => claim.status === "SLIPPED").length;

  return (
    <PageShell>
      <section className="hero hero--split home-hero reveal">
        <div className="hero-copy">
          <span className="eyebrow">Public promises. Public receipts.</span>
          <h1 aria-label="Public receipts for crypto promises.">
            Public receipts for <span className="accent-text">crypto promises.</span>
          </h1>
          <p className="hero-lead">
            Capture the claim, preserve the source, attach the deadline, and publish
            one neutral receipt after review.
          </p>
          <div className="hero-actions">
            <Link href={`/?status=${status}`} className="button">
              View receipts
            </Link>
            <Link href="/due" className="button secondary">
              See due claims
            </Link>
          </div>
          <div className="watch-strip" aria-label="Product guarantees">
            <span>Reviewed first</span>
            <span>Source linked</span>
            <span>Deadline preserved</span>
          </div>
        </div>
        <div className="hero-side">
          <ReceiptHeroVisual />
        </div>
      </section>

      <FeaturedRecordTable claim={previewClaim} secondaryClaim={claims[1] ?? allClaims[1]} />

      <div className="proof-strip reveal-delayed" aria-label="Record summary">
        <div>
          <strong>{allClaims.length}</strong>
          <span>Total receipts</span>
        </div>
        <div>
          <strong>{claims.length}</strong>
          <span>{activeLabel} in view</span>
        </div>
        <div>
          <strong>{deliveredCount}</strong>
          <span>Delivered records</span>
        </div>
        <div>
          <strong>{slippedCount}</strong>
          <span>Slipped records</span>
        </div>
      </div>

      <SectionShell
        id="how-it-works"
        eyebrow="How It Works"
        title="From public claim to durable receipt"
        body="Capture the source, review the claim, then publish one neutral record."
      >
        <ol className="step-list">
          <li>
            <span className="step-number">01</span>
            <div>
              <h3>Capture the public source</h3>
              <p>Preserve the quote, source, and stated deadline.</p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <h3>Review before publishing</h3>
              <p>Drafts and evidence stay internal until a reviewer approves them.</p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>Publish one clear record</h3>
              <p>Status history and evidence remain tied to the same receipt.</p>
            </div>
          </li>
        </ol>
      </SectionShell>

      <SectionShell
        eyebrow="Live Examples"
        title={`${activeLabel} receipts`}
        body="Time-bounded public claims, preserved with source and deadline context."
        actions={
          <div className="segmented" aria-label="Receipt filters">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href ?? `/?status=${tab.status}`}
                className="segmented-link"
                aria-current={
                  (tab.href && tab.href === "/due" && activeTab.href === "/due") ||
                  (!tab.href && tab.status === status)
                    ? "page"
                    : undefined
                }
              >
                {tab.label}
              </Link>
            ))}
          </div>
        }
      >
        <ClaimGrid claims={featuredClaims} />
      </SectionShell>

      <SectionShell
        eyebrow="Built For Agents"
        title="MCP and HUD are first-class surfaces"
        body="Human-readable pages and machine-readable outputs stay aligned."
      >
        <div className="content-grid content-grid--balanced technical-grid">
          <div>
            <span className="card-kicker">MCP</span>
            <h3 className="card-title">Structured records for agent use</h3>
            <p className="card-body">
              Agents can pull public-safe claim and record data without scraping
              page chrome.
            </p>
            <pre className="code-block">
              {`GET /api/public/claims?query=example-protocol
GET /api/public/projects/example-protocol/record`}
            </pre>
          </div>
          <div>
            <span className="card-kicker">HUD</span>
            <h3 className="card-title">Compact project export</h3>
            <p className="card-body">
              The HUD surface exposes the latest claim, due-soon count, and
              public record URL in one concise payload.
            </p>
            <pre className="code-block">
              {`GET /api/hud/project/example-protocol
{
  "projectSlug": "example-protocol",
  "openClaims": 2,
  "dueSoonClaims": 2
}`}
            </pre>
          </div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
