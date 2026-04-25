import React from "react";
import Link from "next/link";
import { getPublicStatusLabel } from "@clocked/core";
import { SectionShell, StatCard } from "@clocked/ui";
import { notFound } from "next/navigation";

import { ClaimGrid } from "../../../components/ClaimGrid";
import { PageShell } from "../../../components/PageShell";
import { getProjectRecordBySlug } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getProjectRecordBySlug(slug);

  if (!record) {
    notFound();
  }

  const statusCards = [
    { status: "OPEN", count: record.countsByStatus.OPEN, tone: "accent" as const },
    {
      status: "DELIVERED",
      count: record.countsByStatus.DELIVERED,
      tone: "success" as const
    },
    {
      status: "SLIPPED",
      count: record.countsByStatus.SLIPPED,
      tone: "warning" as const
    },
    {
      status: "REFRAMED",
      count: record.countsByStatus.REFRAMED,
      tone: "neutral" as const
    }
  ];

  return (
    <PageShell>
      <section className="hero hero--split reveal">
        <div className="hero-copy">
          <span className="eyebrow">Project record</span>
          <h1>{record.project.name}</h1>
          {record.project.description ? (
            <p className="hero-lead">{record.project.description}</p>
          ) : null}
          <p className="page-intro-body">{record.factualSummary}</p>
          <div className="hero-meta">
            <span className="hero-meta-item">Neutral public record</span>
            <span className="hero-meta-item">Review-gated</span>
            {record.project.officialXHandle ? (
              <span className="hero-meta-item">@{record.project.officialXHandle}</span>
            ) : null}
          </div>
        </div>
        <aside className="hero-side summary-block">
          <span className="card-kicker">Overview</span>
          <h2 className="card-title">{record.claims.length} public claims recorded</h2>
          <p className="card-body">
            Open claims, delivered outcomes, and later status changes stay tied to one
            project record.
          </p>
          <div className="hero-actions">
            <a href={record.publicUrl} className="button secondary">
              Open public URL
            </a>
            <a href={`/api/hud/project/${record.project.slug}`} className="text-link">
              View HUD
            </a>
          </div>
        </aside>
      </section>
      <div className="stats-grid reveal-delayed">
        <StatCard label="Open" value={record.countsByStatus.OPEN} detail="Claims still active against their recorded deadline." tone="accent" />
        <StatCard label="Delivered" value={record.countsByStatus.DELIVERED} detail="Claims with reviewed public delivery evidence." tone="success" />
        <StatCard label="Due soon" value={record.dueSoon.length} detail="Open claims currently approaching deadline." tone="warning" />
        <StatCard label="Actors" value={record.project.actors.length} detail="Associated public sources linked to this project." />
      </div>
      <SectionShell
        title="Status distribution"
        body="Counts are presented as a factual snapshot of the current public record."
      >
        <div className="stats-grid">
          {statusCards.map((item) => (
            <StatCard
              key={item.status}
              label={getPublicStatusLabel(item.status as never)}
              value={item.count}
              tone={item.tone}
            />
          ))}
        </div>
      </SectionShell>
      <SectionShell
        title="Related actors"
        body="Associated public sources linked to this project record."
      >
        {record.project.actors.length > 0 ? (
          <div className="link-list">
            {record.project.actors.map((actor) => (
              <Link
                key={actor.id}
                href={`/a/${actor.platform.toLowerCase()}/${actor.handle}`}
                className="link-list-item"
              >
                <span className="mini-label">{actor.platform}</span>
                <strong>@{actor.handle}</strong>
                <span className="muted-copy">
                  {actor.displayName ?? "Public source linked to this project."}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong className="empty-state-title">No actors linked yet.</strong>
            <p className="empty-state-body">
              Associated public sources will appear here once they are attached to the
              project record.
            </p>
          </div>
        )}
      </SectionShell>
      <SectionShell title="Due soon" body="Open claims currently approaching a deadline window.">
        <ClaimGrid
          claims={record.dueSoon}
          emptyTitle="Nothing due soon."
          emptyBody="No open claim in this project is currently close to deadline."
        />
      </SectionShell>
      <SectionShell title="Recent claims" body="The latest public claims tied to this project.">
        <ClaimGrid
          claims={record.latestClaims}
          emptyTitle="No public claims yet."
          emptyBody="Claims will appear here once reviewed drafts are published."
        />
      </SectionShell>
      <SectionShell title="Recent activity" body="Latest reviewed status changes across the project record.">
        {record.latestStatusChanges.length > 0 ? (
          <ul className="timeline">
            {record.latestStatusChanges.map((event) => (
              <li key={event.id}>
                <span className="timeline-title">{getPublicStatusLabel(event.toStatus)}</span>
                <span className="muted-copy">{event.reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <strong className="empty-state-title">No status changes recorded yet.</strong>
            <p className="empty-state-body">
              When the public record changes, the latest reviewed updates will appear
              here.
            </p>
          </div>
        )}
      </SectionShell>
      <SectionShell title="All claims" body="Every public claim currently attached to this project.">
        <ClaimGrid claims={record.claims} />
      </SectionShell>
    </PageShell>
  );
}
