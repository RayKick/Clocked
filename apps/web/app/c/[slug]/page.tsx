import React from "react";
import Link from "next/link";
import { getPublicStatusLabel, getStatusBodyCopy } from "@clocked/core";
import { SectionShell, StatusBadge } from "@clocked/ui";
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
  const receiptId = claim.id.startsWith("demo-claim-001")
    ? "REC-2026-000124"
    : `REC-${claim.id.slice(-6).toUpperCase()}`;

  return (
    <PageShell>
      <section className="receipt-detail-hero reveal">
        <div className="public-receipt public-receipt--large">
          <div className="hero-receipt-head">
            <div className="project-lockup">
              <span className="project-mark">
                {(claim.project?.name ?? "C").slice(0, 1)}
              </span>
              <div>
                <strong>{claim.project?.name ?? "Unassigned project"}</strong>
                <small>{claim.actor ? `@${claim.actor.handle}` : "Public source"}</small>
              </div>
            </div>
            <StatusBadge status={claim.status} />
          </div>
          <span className="eyebrow">Public receipt</span>
          <h1>{claim.normalizedClaim}</h1>
          <p>{getStatusBodyCopy(claim.status)}</p>
          <div className="hero-receipt-rows">
            <div>
              <span>Source quote</span>
              <strong>“{claim.sourceQuote}”</strong>
            </div>
            <div>
              <span>Deadline</span>
              <strong>{claim.deadlineText ?? "Deadline preserved"}</strong>
              <small>
                {formatRelativeDateLabel(claim.deadlineAt)} · {formatDateOnly(claim.deadlineAt)}
              </small>
            </div>
            <div>
              <span>Evidence required</span>
              <strong>{claim.deliverable}</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>{formatRecordLabel(claim.sourcePost.platform)}</strong>
              <small>Captured {formatShortDate(claim.sourcePost.postedAt)}</small>
            </div>
          </div>
          <div className="hero-receipt-footer">
            <span>Receipt ID</span>
            <strong>{receiptId}</strong>
            <a href={publicUrl}>Share ↗</a>
          </div>
        </div>

        <aside className="receipt-sidebar">
          <div className="surface-card">
            <span className="card-kicker">Receipt URL</span>
            <a href={publicUrl} className="metadata-value">
              {publicUrl}
            </a>
          </div>
          <div className="surface-card">
            <span className="card-kicker">Project</span>
            {claim.project ? (
              <Link href={`/p/${claim.project.slug}`} className="metadata-value">
                {claim.project.name}
              </Link>
            ) : (
              <span className="metadata-value">Unassigned</span>
            )}
          </div>
          <div className="surface-card">
            <span className="card-kicker">Correction or dispute</span>
            <p className="card-body">
              If the source, deadline, or outcome is wrong, submit a correction with
              public evidence. Corrections are reviewed and logged.
            </p>
            <Link href="/methodology#disputes" className="text-link">
              Read dispute process →
            </Link>
          </div>
        </aside>
      </section>

      <div className="detail-grid">
        <SectionShell
          title="Status history"
          body="Status labels describe the public record only."
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
                receipt.
              </p>
            </div>
          )}
        </SectionShell>
      </div>

      <SectionShell
        title="Assessment criteria"
        body={latestStatusEvent?.reason ?? "Criteria are reviewed before a public status change."}
      >
        <div className="content-grid content-grid--balanced">
          <div className="surface-card">
            <span className="card-kicker">Delivery criteria</span>
            <ul className="simple-list">
              {claim.deliveryCriteriaJson.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="surface-card">
            <span className="card-kicker">Non-delivery criteria</span>
            <ul className="simple-list">
              {claim.nonDeliveryCriteriaJson.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
