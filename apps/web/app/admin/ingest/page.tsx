import React from "react";
import Link from "next/link";
import { SectionShell } from "@clocked/ui";

import { PageShell } from "../../../components/PageShell";
import { getAdminUiState } from "../../../lib/env";

export const dynamic = "force-dynamic";

export default async function AdminIngestPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const adminPassword =
    typeof params.password === "string" ? params.password : undefined;
  const adminUiState = getAdminUiState();
  const result = {
    reviewItemId:
      typeof params.reviewItemId === "string" ? params.reviewItemId : undefined,
    verdict: typeof params.verdict === "string" ? params.verdict : undefined,
    message: typeof params.message === "string" ? params.message : undefined,
    normalizedClaim:
      typeof params.normalizedClaim === "string" ? params.normalizedClaim : undefined,
    deadlineAt: typeof params.deadlineAt === "string" ? params.deadlineAt : undefined,
    reason: typeof params.reason === "string" ? params.reason : undefined,
    error: typeof params.error === "string" ? params.error : undefined
  };

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Admin ingest</span>
        <h1>Read-only X URL ingestion</h1>
        <p>
          Dry-run read-only ingestion. This creates review items only. It does
          not post to X.
        </p>
        <div className="panel" style={{ marginTop: "1rem" }}>
          <strong>{adminUiState.bannerTitle}</strong>
          <p style={{ marginBottom: 0 }}>{adminUiState.bannerBody}</p>
        </div>
      </section>

      <SectionShell
        eyebrow="Ingest"
        title="Create review item from X URL"
        body="Paste a public X post URL. In dry-run mode, provide source text manually unless you are using a known fixture URL."
      >
        <form
          action="/api/admin/ingest/x-post"
          method="post"
          className="panel"
          style={{ display: "grid", gap: "0.9rem" }}
        >
          <input type="hidden" name="adminPassword" value={adminPassword ?? ""} />
          <input type="hidden" name="redirectTo" value="/admin/ingest" />
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>X post URL</span>
            <input
              type="url"
              name="url"
              placeholder="https://x.com/examplefounder/status/1234567890"
              required
            />
          </label>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Source text override for dry-run</span>
            <textarea
              name="sourceText"
              rows={4}
              placeholder="Rewards dashboard ships by Friday."
            />
          </label>
          <div className="detail-grid">
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Project slug</span>
              <input name="projectSlug" placeholder="example-protocol" />
            </label>
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>Actor handle</span>
              <input name="actorHandle" placeholder="examplefounder" />
            </label>
          </div>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Posted at override</span>
            <input
              type="text"
              name="postedAt"
              placeholder="2026-04-18T09:00:00.000Z"
            />
          </label>
          <div className="admin-actions">
            <button type="submit">Create review item</button>
            <Link href="/admin/review" className="button secondary">
              Open review queue
            </Link>
          </div>
        </form>

        {result.error ? (
          <div className="panel">
            <strong>Ingest error</strong>
            <p style={{ marginBottom: 0 }}>{result.error}</p>
          </div>
        ) : null}

        {result.reviewItemId ? (
          <div className="panel">
            <strong>Latest ingest result</strong>
            <p>Verdict: {result.verdict}</p>
            {result.normalizedClaim ? <p>Normalized claim: {result.normalizedClaim}</p> : null}
            {result.deadlineAt ? <p>Deadline at: {result.deadlineAt}</p> : null}
            {result.reason ? <p>Reason: {result.reason}</p> : null}
            {result.message ? <p>{result.message}</p> : null}
            <p style={{ marginBottom: 0 }}>
              Review item: <code>{result.reviewItemId}</code>. Approval still
              does not post externally.
            </p>
          </div>
        ) : null}
      </SectionShell>
    </PageShell>
  );
}
