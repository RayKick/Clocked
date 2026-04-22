import React from "react";
import Link from "next/link";
import { SectionShell } from "@clocked/ui";

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

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Dry-run safety</span>
        <h1>Admin review queue</h1>
        <p>
          Dry-run mode: approvals create local records only. X posting and live
          HeyAnon/Gemma calls are disabled.
        </p>
        <div className="panel" style={{ marginTop: "1rem" }}>
          <strong>{adminUiState.bannerTitle}</strong>
          <p style={{ marginBottom: 0 }}>{adminUiState.bannerBody}</p>
        </div>
        {adminUiState.passwordRequired && !adminUiState.queryPasswordAllowed ? (
          <div className="panel" style={{ marginTop: "1rem" }}>
            <strong>Staging-safe admin mode</strong>
            <p style={{ marginBottom: 0 }}>
              Browser forms remain visible for review, but protected mutations
              should be called with the <code>x-clocked-admin-password</code>{" "}
              header unless you explicitly enable the local-only query fallback.
            </p>
          </div>
        ) : null}
      </section>
      <SectionShell
        eyebrow="Pending"
        title="Admin review queue"
        body="Approving CLAIM_CREATE turns a reviewed draft into a public claim and creates a draft bot reply. Approval does not post externally."
      >
        <div className="tabs" style={{ marginBottom: "1rem" }}>
          <Link href="/admin/ingest" className="tab">
            Create review item from X URL
          </Link>
        </div>
        <div className="card-grid">
          {reviewItems.map((item) => (
            <AdminReviewCard
              key={item.id}
              reviewItem={item}
              adminPassword={adminPassword}
            />
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
