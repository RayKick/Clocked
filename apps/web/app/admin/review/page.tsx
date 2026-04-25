import React from "react";
import Link from "next/link";
import { SectionShell, StatCard } from "@clocked/ui";

import { AdminReviewCard } from "../../../components/AdminReviewCard";
import { PageShell } from "../../../components/PageShell";
import { getAdminReviewItems } from "../../../lib/data";
import { getAdminUiState, isAdminQueryPasswordAllowed } from "../../../lib/env";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const adminPassword = isAdminQueryPasswordAllowed()
    ? typeof params.adminPassword === "string"
      ? params.adminPassword
      : typeof params.password === "string"
        ? params.password
        : undefined
    : undefined;
  const reviewItems = await getAdminReviewItems();
  const adminUiState = getAdminUiState();
  const claimCreates = reviewItems.filter((item) => item.kind === "CLAIM_CREATE");
  const statusChanges = reviewItems.filter((item) => item.kind === "STATUS_CHANGE");
  const evidenceItems = reviewItems.filter((item) =>
    ["HEYANON_EVIDENCE", "EVIDENCE_REVIEW"].includes(item.kind)
  );
  const otherItems = reviewItems.filter(
    (item) =>
      !["CLAIM_CREATE", "STATUS_CHANGE", "HEYANON_EVIDENCE", "EVIDENCE_REVIEW"].includes(
        item.kind
      )
  );
  const queueGroups = [
    {
      id: "claim-drafts",
      title: "Claim drafts",
      body: "Potential new public claims extracted from public sources and waiting for review.",
      items: claimCreates
    },
    {
      id: "status-changes",
      title: "Status changes",
      body: "Reviewed updates to the state of an existing public claim.",
      items: statusChanges
    },
    {
      id: "evidence",
      title: "Evidence and context",
      body: "Evidence attachments and reviewed supporting context waiting to be applied.",
      items: evidenceItems
    },
    {
      id: "other-review",
      title: "Other review items",
      body: "Anything else that needs a manual decision before it changes the local record.",
      items: otherItems
    }
  ];

  return (
    <PageShell>
      <section className="hero hero--compact admin-hero reveal">
        <div className="page-intro">
          <span className="eyebrow">Dry-run safety</span>
          <h1 className="page-intro-title">Admin review queue</h1>
          <p className="page-intro-body">
            Review claim drafts, status changes, and evidence without enabling live
            posting or live model calls.
          </p>
          <div className="hero-actions">
            <Link href="/admin/ingest" className="button">
              Create review item
            </Link>
            <Link href="/admin" className="button secondary">
              Admin overview
            </Link>
          </div>
        </div>
        <div className="content-grid content-grid--balanced">
          <div className="banner banner--warning">
            <strong className="banner-title">Dry-run mode stays on</strong>
            <p className="muted-copy">
              Approvals create local records only. X posting and live HeyAnon or
              Gemma calls remain disabled.
            </p>
          </div>
          <div className="banner">
            <strong className="banner-title">{adminUiState.bannerTitle}</strong>
            <p className="muted-copy">{adminUiState.bannerBody}</p>
          </div>
        </div>
        {adminUiState.passwordRequired && !adminUiState.queryPasswordAllowed ? (
          <div className="banner">
            <strong className="banner-title">Staging-safe admin mode</strong>
            <p className="muted-copy">
              Browser forms remain visible for review, but protected mutations
              should be called with the <code>x-clocked-admin-password</code>{" "}
              header unless you explicitly enable the local-only query fallback.
            </p>
          </div>
        ) : null}
      </section>
      <div className="stats-grid reveal-delayed">
        <StatCard label="Pending items" value={reviewItems.length} detail="Everything currently waiting for human review." tone="accent" />
        <StatCard label="Claim drafts" value={claimCreates.length} detail="Potential new public claims extracted from source material." />
        <StatCard label="Status changes" value={statusChanges.length} detail="Updates to existing public claim records." />
        <StatCard label="Evidence" value={evidenceItems.length} detail="Evidence or supporting context pending review." />
      </div>
      <SectionShell
        eyebrow="Pending"
        title="Pending queue"
        body="Approving a review item updates the local record only. Nothing here posts externally."
        actions={
          <div className="segmented">
            <a href="#claim-drafts" className="segmented-link">
              Claim drafts
            </a>
            <a href="#status-changes" className="segmented-link">
              Status changes
            </a>
            <a href="#evidence" className="segmented-link">
              Evidence
            </a>
            <a href="#other-review" className="segmented-link">
              Other
            </a>
          </div>
        }
      >
        <div className="queue-grid">
          {queueGroups.map((group) => (
            <section key={group.id} id={group.id} className="queue-group">
              <div className="section-head">
                <div className="section-copy">
                  <h3 className="section-title">{group.title}</h3>
                  <p className="section-body">{group.body}</p>
                </div>
                <span className="tab">{group.items.length} pending</span>
              </div>
              {group.items.length > 0 ? (
                <div className="review-stack">
                  {group.items.map((item) => (
                    <AdminReviewCard
                      key={item.id}
                      reviewItem={item}
                      adminPassword={adminPassword}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <strong className="empty-state-title">Nothing pending here.</strong>
                  <p className="empty-state-body">
                    New review items in this group will appear when they enter the queue.
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
