import React from "react";
import Link from "next/link";
import { getPublicStatusLabel } from "@clocked/core";
import { SectionShell, StatCard } from "@clocked/ui";
import { notFound } from "next/navigation";

import { ClaimGrid } from "../../../../components/ClaimGrid";
import { PageShell } from "../../../../components/PageShell";
import { getActorRecordByHandle } from "../../../../lib/data";

export const dynamic = "force-dynamic";

function formatActorType(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ActorPage({
  params
}: {
  params: Promise<{ platform: string; handle: string }>;
}) {
  const { platform, handle } = await params;
  const record = await getActorRecordByHandle(platform.toUpperCase() as never, handle);

  if (!record) {
    notFound();
  }

  return (
    <PageShell>
      <section className="hero hero--split reveal">
        <div className="hero-copy">
          <span className="eyebrow">{record.actor.platform}</span>
          <h1>@{record.actor.handle}</h1>
          {record.actor.displayName ? (
            <p className="hero-lead">{record.actor.displayName}</p>
          ) : null}
          <p className="page-intro-body">{record.factualSummary}</p>
          <div className="hero-meta">
            <span className="hero-meta-item">{formatActorType(record.actor.actorType)}</span>
            <span className="hero-meta-item">
              {record.actor.verifiedSource ? "Verified source" : "Unverified source"}
            </span>
            <span className="hero-meta-item">Record only</span>
          </div>
        </div>
        <aside className="hero-side summary-block">
          <span className="card-kicker">Public record</span>
          <h2 className="card-title">Neutral track record view</h2>
          <p className="card-body">
            This page lists claims and linked projects. It does not rank or judge
            the actor.
          </p>
          <a href={record.publicUrl} className="button secondary">
            Open public URL
          </a>
        </aside>
      </section>
      <div className="stats-grid reveal-delayed">
        <StatCard label="Claims" value={record.latestClaims.length} detail="Recent claims linked to this actor." tone="accent" />
        <StatCard label="Open" value={record.countsByStatus.OPEN} detail="Claims still active against their recorded deadline." />
        <StatCard label="Delivered" value={record.countsByStatus.DELIVERED} detail="Claims with reviewed public delivery evidence." tone="success" />
        <StatCard label="Projects" value={record.associatedProjects.length} detail="Associated projects linked to the actor." />
      </div>
      <SectionShell title="Status mix" body="A factual breakdown of reviewed public statuses linked to this actor.">
        <div className="stats-grid">
          {Object.entries(record.countsByStatus).map(([label, count]) => (
            <StatCard
              key={label}
              label={getPublicStatusLabel(label as never)}
              value={count}
            />
          ))}
        </div>
      </SectionShell>
      <SectionShell title="Associated projects">
        {record.associatedProjects.length > 0 ? (
          <div className="link-list">
            {record.associatedProjects.map((project: { id: string; name: string; slug: string }) => (
              <Link key={project.id} href={`/p/${project.slug}`} className="link-list-item">
                <span className="mini-label">Project</span>
                <strong>{project.name}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong className="empty-state-title">No associated projects yet.</strong>
            <p className="empty-state-body">
              Linked projects will appear here once they are connected to the actor record.
            </p>
          </div>
        )}
      </SectionShell>
      <SectionShell title="Recent claims" body="Latest public claims linked to this actor.">
        <ClaimGrid
          claims={record.latestClaims}
          emptyTitle="No recent claims."
          emptyBody="Claims will appear here after review once they are linked to this actor."
        />
      </SectionShell>
      <SectionShell title="Recent activity" body="Latest reviewed status changes tied to the actor record.">
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
              Reviewed status changes will appear here when the public record updates.
            </p>
          </div>
        )}
      </SectionShell>
    </PageShell>
  );
}
