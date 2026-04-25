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

const trustSignals = [
  "Source-linked",
  "Deadline-preserved",
  "Review-gated",
  "Machine-readable"
];

const sortOptions = [
  { label: "Recently updated", value: "recent" },
  { label: "Due soon", value: "deadline" },
  { label: "Project", value: "project" },
  { label: "Status", value: "status" }
];

const clockClaimUrl =
  "https://x.com/intent/tweet?text=%40ClockedBot%20clock%20this%20%5Bpaste%20public%20source%20link%5D";

const useCases = [
  {
    title: "Communities",
    body: "No more screenshot archaeology.",
    icon: "CM"
  },
  {
    title: "Traders",
    body: "Track whether teams ship or shape-shift.",
    icon: "TR"
  },
  {
    title: "Teams",
    body: "Prove delivery with neutral receipts.",
    icon: "TM"
  },
  {
    title: "Agents",
    body: "Query structured records through API and HUD.",
    icon: "AI"
  }
];

export const dynamic = "force-dynamic";

function ProductLoop() {
  return (
    <div className="product-loop" aria-label="How CLOCKED creates a receipt">
      <div className="tweet-card tweet-card--source">
        <div className="tweet-author">
          <span className="avatar-dot">A</span>
          <div>
            <strong>Atlas Labs</strong>
            <small>@atlaslabs · 4h</small>
          </div>
        </div>
        <p>SDK next week 🚀</p>
        <div className="tweet-meta">
          <span>12 replies</span>
          <span>94 likes</span>
        </div>
      </div>
      <div className="loop-arrow" aria-hidden="true" />
      <div className="tweet-card tweet-card--reply">
        <div className="tweet-author">
          <span className="avatar-dot avatar-dot--builder">B</span>
          <div>
            <strong>Builder.eth</strong>
            <small>@buildereth · 2m</small>
          </div>
        </div>
        <p>
          <span className="accent-text">@ClockedBot</span> clock this
        </p>
      </div>
      <div className="loop-result">
        <span className="mini-label">Receipt created</span>
        <strong>Claim structured with source, deadline, and review criteria.</strong>
      </div>
    </div>
  );
}

function HeroReceiptPreview() {
  return (
    <Link
      href="/c/atlas-labs-mainnet-public-beta-by-april-30-2026"
      className="hero-receipt"
      aria-label="Open example receipt"
    >
      <div className="hero-receipt-head">
        <div className="project-lockup">
          <span className="project-mark">A</span>
          <div>
            <strong>Atlas Labs</strong>
            <small>Example receipt</small>
          </div>
        </div>
        <StatusBadge status="OPEN" />
      </div>
      <div className="hero-receipt-rows">
        <div>
          <span>Source quote</span>
          <strong>“Mainnet public beta by April 30.”</strong>
        </div>
        <div>
          <span>Normalized claim</span>
          <strong>Atlas Labs will open mainnet public beta by 30 Apr 2026.</strong>
        </div>
        <div>
          <span>Deadline</span>
          <strong>30 Apr 2026 · 23:59 UTC</strong>
        </div>
        <div>
          <span>Evidence required</span>
          <strong>Public beta accessible</strong>
        </div>
      </div>
      <div className="hero-receipt-footer">
        <span>Receipt ID</span>
        <strong>REC-2026-000124</strong>
        <span className="share-affordance">Share ↗</span>
      </div>
    </Link>
  );
}

function MethodologyTeaser() {
  const points = [
    ["Status labels only", "Open, Delivered, Slipped, Reframed, Ambiguous."],
    ["Evidence attached", "Links, artifacts, and timestamps stay with the receipt."],
    ["Dispute process", "Corrections are logged; reviewers decide."],
    ["Reviewer log", "Human decisions remain visible in status history."]
  ];

  return (
    <div className="methodology-panel">
      <div className="methodology-list">
        <Link href="/methodology">What counts as a clockable claim</Link>
        <Link href="/methodology">How deadlines are normalized</Link>
        <Link href="/methodology">How delivery evidence is evaluated</Link>
        <Link href="/methodology">How disputes and corrections work</Link>
      </div>
      <div className="methodology-rules">
        <span className="card-kicker">Neutral by design</span>
        {points.map(([title, body]) => (
          <div key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
        ))}
      </div>
    </div>
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
  const sort = typeof params.sort === "string" ? params.sort : "recent";
  const [claims, allClaims] = await Promise.all([
    getClaims({ status, query, limit: 24 }),
    getClaims({ query, limit: 100 })
  ]);
  const activeTab = tabs.find((tab) => tab.status === status) ?? tabs[0]!;
  const activeLabel =
    activeTab.label === "Due Soon" ? "Due soon" : getPublicStatusLabel(status as never);
  const launchClaims = [
    ...claims.filter((claim) => !claim.id.startsWith("sample-")),
    ...claims.filter((claim) => claim.id.startsWith("sample-"))
  ].sort((a, b) => {
    if (sort === "deadline") {
      return (a.deadlineAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (b.deadlineAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    }

    if (sort === "project") {
      return (a.project?.name ?? "").localeCompare(b.project?.name ?? "");
    }

    if (sort === "status") {
      return a.status.localeCompare(b.status);
    }

    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  const featuredClaims = launchClaims.slice(0, 3);
  const sampleReceiptCount = launchClaims.filter((claim) => claim.id.startsWith("sample-")).length;
  const dueSoonCount = allClaims.filter(
    (claim) =>
      claim.status === "OPEN" &&
      claim.deadlineAt &&
      claim.deadlineAt.getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000
  ).length;
  const deliveredCount = allClaims.filter((claim) => claim.status === "DELIVERED").length;
  const slippedCount = allClaims.filter((claim) => claim.status === "SLIPPED").length;
  const isExampleLayer =
    allClaims.length > 0 && allClaims.every((claim) => claim.id.startsWith("sample-"));

  return (
    <PageShell>
      <section className="hero hero--split home-hero reveal">
        <div className="hero-copy">
          <span className="eyebrow">PUBLIC MEMORY FOR CRYPTO PROMISES</span>
          <h1>
            When crypto says “soon”, <span className="accent-text">CLOCKED starts the timer.</span>
          </h1>
          <p className="hero-lead">
            Tag @ClockedBot under a public promise. CLOCKED extracts the claim,
            locks the source and deadline, drafts delivery criteria, and publishes a
            reviewed public receipt.
          </p>
          <div className="hero-actions">
            <a href={clockClaimUrl} className="button" target="_blank" rel="noreferrer">
              Clock a claim →
            </a>
            <a href="#live-receipts" className="button secondary">
              View live receipts ↗
            </a>
          </div>
          <div className="watch-strip" aria-label="Product guarantees">
            {trustSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>
        <div className="hero-side">
          <HeroReceiptPreview />
        </div>
      </section>

      <div className="proof-strip reveal-delayed" aria-label="Record summary">
        <div>
          <strong>{allClaims.length}</strong>
          <span>{isExampleLayer ? "example receipts" : "receipts"}</span>
        </div>
        <div>
          <strong>{dueSoonCount}</strong>
          <span>due soon</span>
        </div>
        <div>
          <strong>{deliveredCount}</strong>
          <span>delivered</span>
        </div>
        <div>
          <strong>{slippedCount}</strong>
          <span>slipped</span>
        </div>
      </div>

      <SectionShell
        id="clock-this"
        title="How CLOCKED works"
        body="A simple public accountability loop."
      >
        <div className="how-grid">
          <ProductLoop />
          <ol className="step-list step-list--launch">
            <li>
              <span className="step-number">1</span>
              <div>
                <h3>Capture the source</h3>
                <p>
                  A founder, team, or protocol makes a public promise on X,
                  Discord, Telegram, a blog, or a roadmap.
                </p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div>
                <h3>Review the claim</h3>
                <p>
                  CLOCKED structures the claim, deadline, and delivery criteria.
                  Review happens before anything becomes public.
                </p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div>
                <h3>Publish the receipt</h3>
                <p>
                  One neutral record goes live with source, deadline, status
                  history, and attached evidence.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </SectionShell>

      <SectionShell
        id="live-receipts"
        title="Live receipts"
        body="See what teams promised, when they promised it, and what actually happened. Every receipt keeps the source, deadline, evidence, and status history attached."
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
        <form className="ledger-toolbar" action="/" aria-label="Search live receipts">
          <input type="hidden" name="status" value={status} />
          <label>
            <span>Search receipts</span>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search project, founder, ticker, source..."
            />
          </label>
          <label>
            <span>Sort</span>
            <select name="sort" defaultValue={sort}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button className="button secondary" type="submit">
            Search
          </button>
          {query ? (
            <Link href={`/?status=${status}`} className="text-link">
              Clear
            </Link>
          ) : null}
        </form>
        {sampleReceiptCount > 0 ? (
          <div className="sample-notice" role="note">
            <strong>{sampleReceiptCount} example receipts shown.</strong>
            <span>
              Example records are marked clearly. Reviewed public records appear ahead of examples when available.
            </span>
          </div>
        ) : null}
        <ClaimGrid claims={featuredClaims} emptyTitle={`No ${activeLabel} receipts yet.`} />
      </SectionShell>

      <SectionShell title="Why people use CLOCKED">
        <div className="use-case-grid">
          {useCases.map((item) => (
            <div key={item.title} className="surface-card use-case-card">
              <span className="use-case-icon">{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Methodology first"
        body="CLOCKED is not a dunk bot. It preserves public claims, deadlines, evidence, and reviewed status changes."
      >
        <MethodologyTeaser />
      </SectionShell>

      <SectionShell
        title="Built for agents"
        body="Built for agents, readable by humans. Human-readable pages and machine-readable records stay aligned."
      >
        <div className="agent-panel">
          <pre className="code-block">{`GET /api/public/claims?query=nova-chain
GET /api/hud/project/nova-chain

{
  "project": "NovaChain",
  "claim": "NovaChain will ship a public testnet explorer by 3 May 2026.",
  "status": "OPEN",
  "deadline": "2026-05-03T23:59:00Z",
  "source": "x.com/..."
}`}</pre>
          <span className="agent-format">JSON</span>
        </div>
      </SectionShell>

      <section className="final-cta reveal">
        <div>
          <h2>Clock the next promise before it gets forgotten.</h2>
          <p>Turn public crypto claims into permanent, source-linked receipts.</p>
        </div>
        <div className="hero-actions">
          <a href={clockClaimUrl} className="button" target="_blank" rel="noreferrer">
            Clock a claim →
          </a>
          <Link href="/methodology" className="button secondary">
            Read methodology →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
