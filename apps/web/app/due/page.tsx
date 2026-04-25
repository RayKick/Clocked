import React from "react";
import Link from "next/link";
import { SectionShell, StatCard } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getDueBuckets } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function DuePage() {
  const buckets = await getDueBuckets();
  const todayCount = buckets.today.length;
  const weekCount = buckets.thisWeek.length;
  const overdueCount = buckets.overdue.length;
  const deliveredCount = buckets.recentlyDelivered.length;

  return (
    <PageShell>
      <section className="hero hero--compact reveal">
        <div className="page-intro">
          <span className="eyebrow">Due digest</span>
          <h1 className="page-intro-title">Claims on the clock.</h1>
          <p className="page-intro-body">
            A calm command view for upcoming deadlines, overdue open claims, and
            recent outcomes.
          </p>
          <p className="page-intro-body">{buckets.digest}</p>
          <div className="segmented">
            <a href="#due-today" className="segmented-link">
              Due today
            </a>
            <a href="#due-week" className="segmented-link">
              This week
            </a>
            <a href="#due-overdue" className="segmented-link">
              Overdue
            </a>
            <Link href="/delivered" className="segmented-link">
              Delivered
            </Link>
            <Link href="/slipped" className="segmented-link">
              Slipped
            </Link>
          </div>
        </div>
        <div className="stats-grid">
          <StatCard label="Due today" value={todayCount} detail="Claims landing in the next UTC day." tone="accent" />
          <StatCard label="Due this week" value={weekCount} detail="Open claims approaching their deadline window." tone="warning" />
          <StatCard label="Overdue" value={overdueCount} detail="Open claims whose deadline has already passed." tone="warning" />
          <StatCard label="Recently delivered" value={deliveredCount} detail="Recent positive outcomes in the public record." tone="success" />
        </div>
      </section>
      <div id="due-today">
        <SectionShell
          title="Due today"
          body="Claims whose recorded deadline lands today in UTC."
          actions={<span className="tab">{todayCount} in view</span>}
        >
          <ClaimGrid
            claims={buckets.today}
            emptyTitle="Nothing due today."
            emptyBody="The public queue is quiet for the rest of the day."
          />
        </SectionShell>
      </div>
      <div id="due-week">
        <SectionShell
          title="Due this week"
          body="Open claims that are approaching their recorded deadline."
          actions={<span className="tab">{weekCount} upcoming</span>}
        >
          <ClaimGrid
            claims={buckets.thisWeek}
            emptyTitle="Nothing due this week."
            emptyBody="No open public claim is approaching a recorded deadline right now."
          />
        </SectionShell>
      </div>
      <div id="due-overdue">
        <SectionShell
          title="Overdue pending review"
          body="Open claims whose deadline has passed and may need review."
          actions={<span className="tab">{overdueCount} overdue</span>}
        >
          <ClaimGrid
            claims={buckets.overdue}
            emptyTitle="No overdue open claims."
            emptyBody="Nothing in the open record appears past deadline without review."
          />
        </SectionShell>
      </div>
      <SectionShell
        title="Recently delivered"
        body="Public outcomes with recorded delivery evidence."
        actions={<span className="tab">{deliveredCount} recent</span>}
      >
        <ClaimGrid
          claims={buckets.recentlyDelivered}
          emptyTitle="No recent delivered outcomes."
          emptyBody="Delivered claims will appear here once recent evidence is reviewed."
        />
      </SectionShell>
      <SectionShell
        title="Recently reframed"
        body="Claims whose public context changed after the original statement."
        actions={<span className="tab">{buckets.recentlyReframed.length} recent</span>}
      >
        <ClaimGrid
          claims={buckets.recentlyReframed}
          emptyTitle="No recent reframes."
          emptyBody="Scope changes and follow-up context will appear here after review."
        />
      </SectionShell>
    </PageShell>
  );
}
