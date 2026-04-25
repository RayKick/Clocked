import React from "react";
import Link from "next/link";
import { getPublicStatusLabel, getStatusBodyCopy } from "@clocked/core";
import { JsonBlock, SectionShell, StatusBadge } from "@clocked/ui";
import { notFound } from "next/navigation";

import { PageShell } from "../../../components/PageShell";
import { getAppBaseUrl } from "../../../lib/env";
import {
  formatDateOnly,
  formatDisplayDate,
  formatRelativeDateLabel,
  formatShortDate
} from "../../../lib/format";
import { getClaimBySlug } from "../../../lib/data";

export const dynamic = "force-dynamic";

function formatRecordLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ClaimPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const claim = await getClaimBySlug(slug);

  if (!claim) {
    notFound();
  }

  const publicUrl = `${getAppBaseUrl()}/c/${claim.publicSlug}`;
  const latestStatusEvent = claim.statusEvents.at(-1);

  return (
    <PageShell>
      <section className="hero hero--split reveal">
        <div className="hero-copy receipt-header">
          <span className="eyebrow">Public receipt</span>
          <StatusBadge status={claim.status} />
          <h1>{claim.normalizedClaim}</h1>
          <p className="hero-lead">{getStatusBodyCopy(claim.status)}</p>
          <div className="hero-meta">
            <span className="hero-meta-item">
              {claim.project?.name ?? "Unassigned project"}
            </span>
            <span className="hero-meta-item">
              {claim.actor ? `@${claim.actor.handle}` : "Unknown source"}
            </span>
            <span className="hero-meta-item">{formatRecordLabel(claim.sourcePost.platform)}</span>
          </div>
        </div>
        <aside className="hero-side receipt-aside">
          <div className="summary-block">
            <span className="card-kicker">Deadline</span>
            <h2 className="card-title">{claim.deadlineText ?? "No deadline text recorded"}</h2>
            <p className="card-body">
              {formatRelativeDateLabel(claim.deadlineAt)}. Recorded for{" "}
              {formatDisplayDate(claim.deadlineAt)}.
            </p>
          </div>
          <div className="summary-block summary-block--quote">
            <span className="card-kicker">Source</span>
            <div className="quote-block">“{claim.sourceQuote}”</div>
            <p className="card-body">Posted {formatShortDate(claim.sourcePost.postedAt)}</p>
            {claim.sourcePost.url ? <a href={claim.sourcePost.url}>Open original post</a> : null}
          </div>
        </aside>
      </section>
      <div className="detail-grid">
        <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <SectionShell
            title="Evidence trail"
            body="Public evidence preserved against the original claim."
          >
            {claim.evidence.length > 0 ? (
              <ul className="timeline">
                {claim.evidence.map((evidence) => (
                  <li key={evidence.id}>
                    <span className="timeline-title">{formatRecordLabel(evidence.evidenceType)}</span>
                    <span className="muted-copy">{evidence.summary}</span>
                    <span className="timeline-meta">
                      {evidence.occurredAt
                        ? formatDisplayDate(evidence.occurredAt)
                        : "No occurrence time recorded"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <strong className="empty-state-title">No public evidence attached yet.</strong>
                <p className="empty-state-body">
                  Evidence will appear here after review if public material is added to the
                  claim record.
                </p>
              </div>
            )}
          </SectionShell>
          <SectionShell
            title="Status history"
            body="Statuses describe the public record only."
          >
            <ul className="timeline">
              {claim.statusEvents.map((event) => (
                <li key={event.id}>
                  <span className="timeline-title">{getPublicStatusLabel(event.toStatus)}</span>
                  <span className="muted-copy">{event.reason}</span>
                  <span className="timeline-meta">{formatDisplayDate(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          </SectionShell>
        </div>
        <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <div className="surface-card surface-card--muted">
            <span className="card-kicker">Receipt details</span>
            <div className="metadata-list">
              <div className="metadata-item">
                <span className="metadata-label">Project</span>
                <span className="metadata-value">
                  {claim.project ? (
                    <Link href={`/p/${claim.project.slug}`}>{claim.project.name}</Link>
                  ) : (
                    "Unassigned"
                  )}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Source</span>
                <span className="metadata-value">
                  {claim.actor ? (
                    <Link
                      href={`/a/${claim.actor.platform.toLowerCase()}/${claim.actor.handle}`}
                    >
                      @{claim.actor.handle}
                    </Link>
                  ) : (
                    "Unknown"
                  )}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Deadline</span>
                <span className="metadata-value">
                  {claim.deadlineText} · {formatDateOnly(claim.deadlineAt)}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Receipt URL</span>
                <span className="metadata-value">
                  <a href={publicUrl}>{publicUrl}</a>
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Public JSON</span>
                <span className="metadata-value">
                  <a href={`/api/public/claims?query=${claim.publicSlug}`}>Search result</a>
                </span>
              </div>
            </div>
          </div>
          <div className="surface-card surface-card--plain">
            <span className="card-kicker">Assessment</span>
            {latestStatusEvent?.reason ? (
              <p className="card-body">{latestStatusEvent.reason}</p>
            ) : null}
            <div className="metadata-list">
              <div className="metadata-item">
                <span className="metadata-label">Delivery criteria</span>
                <ul className="simple-list">
                  {claim.deliveryCriteriaJson.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Non-delivery criteria</span>
                <ul className="simple-list">
                  {claim.nonDeliveryCriteriaJson.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {claim.ambiguityNotesJson.length > 0 ? (
                <div className="metadata-item">
                  <span className="metadata-label">Classification notes</span>
                  <ul className="simple-list">
                    {claim.ambiguityNotesJson.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
          <details className="details-reset">
            <summary>Technical context</summary>
            <JsonBlock
              value={claim.heyAnonContextJson ?? { note: "No HeyAnon context recorded." }}
            />
          </details>
        </div>
      </div>
    </PageShell>
  );
}
