import React from "react";
import Link from "next/link";
import { SectionShell, StatCard } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getDueBuckets } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function DuePage() {
  const buckets = await getDueBuckets();
  const dueIn24h = buckets.today;
  const dueThisWeek = buckets.thisWeek;
  const overdue = buckets.overdue;
  const needsReview = overdue;
  const recentlyResolved = [
    ...buckets.recentlyDelivered,
    ...buckets.recentlyReframed
  ].slice(0, 8);

  return (
    <PageShell>
      <section className="hero hero--compact reveal">
        <div className="page-intro">
          <span className="eyebrow">Due soon</span>
          <h1 className="page-intro-title">Deadlines approaching. Receipts waiting for outcome.</h1>
          <p className="page-intro-body">
            Track open promises near deadline, overdue records that need review,
            and recently resolved outcomes.
          </p>
          <p className="page-intro-body">{buckets.digest}</p>
          <div className="segmented">
            <a href="#due-24h" className="segmented-link">
              Due in 24h
            </a>
            <a href="#due-week" className="segmented-link">
              This week
            </a>
            <a href="#overdue" className="segmented-link">
              Overdue
            </a>
            <a href="#needs-review" className="segmented-link">
              Needs review
            </a>
            <a href="#resolved" className="segmented-link">
              Resolved
            </a>
          </div>
        </div>
        <div className="stats-grid">
          <StatCard
            label="Due in 24h"
            value={dueIn24h.length}
            detail="Open receipts landing inside the next UTC day."
            tone="accent"
          />
          <StatCard
            label="Due this week"
            value={dueThisWeek.length}
            detail="Open receipts approaching their deadline window."
            tone="warning"
          />
          <StatCard
            label="Overdue"
            value={overdue.length}
            detail="Open receipts whose deadline has already passed."
            tone="warning"
          />
          <StatCard
            label="Recently resolved"
            value={recentlyResolved.length}
            detail="Delivered or reframed receipts with reviewed outcomes."
            tone="success"
          />
        </div>
      </section>

      <div id="due-24h">
        <SectionShell
          title="Due in 24h"
          body="Open receipts whose recorded deadline lands within the next UTC day."
          actions={<span className="tab">{dueIn24h.length} in view</span>}
        >
          <ClaimGrid
            claims={dueIn24h}
            emptyTitle="Nothing due in the next 24 hours."
            emptyBody="The public queue is quiet for the next day."
          />
        </SectionShell>
      </div>

      <div id="due-week">
        <SectionShell
          title="Due this week"
          body="Open receipts approaching their recorded deadline."
          actions={<span className="tab">{dueThisWeek.length} upcoming</span>}
        >
          <ClaimGrid
            claims={dueThisWeek}
            emptyTitle="Nothing due this week."
            emptyBody="No open public receipt is approaching a recorded deadline right now."
          />
        </SectionShell>
      </div>

      <div id="overdue">
        <SectionShell
          title="Overdue"
          body="Open receipts whose deadline passed before a reviewed outcome was recorded."
          actions={<span className="tab">{overdue.length} overdue</span>}
        >
          <ClaimGrid
            claims={overdue}
            emptyTitle="No overdue open receipts."
            emptyBody="Nothing in the public record appears past deadline without review."
          />
        </SectionShell>
      </div>

      <div id="needs-review">
        <SectionShell
          title="Needs review"
          body="Receipts that may need evidence review because the deadline has passed."
          actions={<span className="tab">{needsReview.length} pending</span>}
        >
          <ClaimGrid
            claims={needsReview}
            emptyTitle="No receipts need outcome review."
            emptyBody="When an open receipt passes deadline, it will appear here for reviewed status evaluation."
          />
        </SectionShell>
      </div>

      <div id="resolved">
        <SectionShell
          title="Recently resolved"
          body="Receipts with reviewed delivered or reframed outcomes."
          actions={<span className="tab">{recentlyResolved.length} recent</span>}
        >
          <ClaimGrid
            claims={recentlyResolved}
            emptyTitle="No recently resolved receipts."
            emptyBody="Reviewed outcomes will appear here once delivery evidence or scope changes are attached."
          />
        </SectionShell>
      </div>

      <section className="final-cta reveal">
        <div>
          <h2>Want the rules behind these labels?</h2>
          <p>Read how CLOCKED handles evidence, deadlines, reframes, and disputes.</p>
        </div>
        <Link href="/methodology" className="button secondary">
          Read methodology →
        </Link>
      </section>
    </PageShell>
  );
}
