import React from "react";
import Link from "next/link";
import { StatCard } from "@clocked/ui";

import { PageShell } from "../../components/PageShell";
import { getAdminSummary } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const summary = await getAdminSummary();
  return (
    <PageShell>
      <section className="hero hero--compact reveal">
        <span className="eyebrow">Admin</span>
        <h1>Review queue and operations console.</h1>
        <p className="hero-lead">
          Review claim drafts, prepare ingest items, and inspect the record without
          weakening dry-run safety.
        </p>
        <div className="hero-actions">
          <Link href="/admin/review" className="button">
            Open review queue
          </Link>
          <Link href="/admin/ingest" className="button secondary">
            Open ingest console
          </Link>
        </div>
      </section>
      <div className="stats-grid reveal-delayed">
        <StatCard label="Pending reviews" value={summary.pendingReviews} detail="Drafts waiting on human review." tone="accent" />
        <StatCard label="Open claims" value={summary.openClaims} detail="Public claims still active against their recorded deadline." />
        <StatCard label="Projects" value={summary.projects} detail="Projects currently represented in the record." />
        <StatCard label="Actors" value={summary.actors} detail="Tracked public sources and official handles." />
      </div>
    </PageShell>
  );
}
