import React from "react";
import Link from "next/link";

import { PageShell } from "../../../components/PageShell";
import { getAdminUiState, isAdminQueryPasswordAllowed } from "../../../lib/env";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminIngestPage({
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
      <section className="hero hero--compact admin-hero reveal">
        <div className="page-intro">
          <span className="eyebrow">Admin ingest</span>
          <h1 className="page-intro-title">Create review items from public sources.</h1>
          <p className="page-intro-body">
            This console is for curation only. It prepares review items and does not
            read or post live content by default.
          </p>
          <div className="hero-actions">
            <Link href="/admin/review" className="button">
              Open review queue
            </Link>
            <Link href="/admin" className="button secondary">
              Admin overview
            </Link>
          </div>
        </div>
        <div className="content-grid content-grid--balanced">
          <div className="banner banner--warning">
            <strong className="banner-title">Dry-run ingest only</strong>
            <p className="muted-copy">
              Creating a review item does not post to X. In local dry-run flows, you
              can provide source text manually.
            </p>
          </div>
          <div className="banner">
            <strong className="banner-title">{adminUiState.bannerTitle}</strong>
            <p className="muted-copy">{adminUiState.bannerBody}</p>
          </div>
        </div>
        {adminUiState.passwordRequired && !adminUiState.queryPasswordAllowed ? (
          <div className="banner">
            <strong className="banner-title">Header auth recommended in staging</strong>
            <p className="muted-copy">
              This page is safe to view publicly, but protected mutations should use
              the <code>x-clocked-admin-password</code> header. Query and form
              password fallback stays off by default.
            </p>
          </div>
        ) : null}
      </section>

      <div className="ingest-layout">
        <form
          action="/api/admin/ingest/x-post"
          method="post"
          className="surface-card surface-card--plain reveal-delayed"
        >
          <div className="page-intro">
            <span className="card-kicker">Create review item</span>
            <h2 className="section-title">Public source input</h2>
            <p className="section-body">
              Paste a public source URL, then optionally add source text or curation
              metadata for the dry-run workflow.
            </p>
          </div>
          {adminPassword ? (
            <input type="hidden" name="adminPassword" value={adminPassword} />
          ) : null}
          <input type="hidden" name="redirectTo" value="/admin/ingest" />
          <label className="field">
            <span className="field-label">Public source URL</span>
            <input
              type="url"
              name="url"
              placeholder="https://x.com/examplefounder/status/1234567890"
              required
            />
            <span className="field-help">
              Use a public X post URL. Fixture URLs still work in the dry-run demo.
            </span>
          </label>
          <label className="field">
            <span className="field-label">Optional source text</span>
            <textarea
              name="sourceText"
              rows={5}
              placeholder="Rewards dashboard ships by Friday."
            />
            <span className="field-help">
              Helpful in local dry-run mode when you want to avoid live reads.
            </span>
          </label>
          <div className="content-grid content-grid--balanced">
            <label className="field">
              <span className="field-label">Project slug</span>
              <input name="projectSlug" placeholder="example-protocol" />
            </label>
            <label className="field">
              <span className="field-label">Actor handle</span>
              <input name="actorHandle" placeholder="examplefounder" />
            </label>
          </div>
          <label className="field">
            <span className="field-label">Posted at override</span>
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
        <div className="ingest-side">
          <div className="surface-card surface-card--muted reveal-delayed">
            <span className="card-kicker">What happens next</span>
            <ul className="simple-list">
              <li>The source is prepared as a review item.</li>
              <li>Nothing becomes public until a reviewer approves it.</li>
              <li>Dry-run mode keeps external posting disabled.</li>
            </ul>
          </div>
          {result.error ? (
            <div className="surface-card surface-card--danger">
              <span className="card-kicker">Ingest error</span>
              <h2 className="card-title">The review item was not created.</h2>
              <p className="card-body">{result.error}</p>
            </div>
          ) : null}
          {result.reviewItemId ? (
            <div className="surface-card surface-card--success">
              <span className="card-kicker">Latest result</span>
              <h2 className="card-title">Review item ready.</h2>
              <div className="metadata-list">
                {result.verdict ? (
                  <div className="metadata-item">
                    <span className="metadata-label">Verdict</span>
                    <span className="metadata-value">{result.verdict}</span>
                  </div>
                ) : null}
                {result.normalizedClaim ? (
                  <div className="metadata-item">
                    <span className="metadata-label">Normalized claim</span>
                    <span className="metadata-value">{result.normalizedClaim}</span>
                  </div>
                ) : null}
                {result.deadlineAt ? (
                  <div className="metadata-item">
                    <span className="metadata-label">Deadline</span>
                    <span className="metadata-value">{result.deadlineAt}</span>
                  </div>
                ) : null}
                {result.reason ? (
                  <div className="metadata-item">
                    <span className="metadata-label">Reason</span>
                    <span className="metadata-value">{result.reason}</span>
                  </div>
                ) : null}
                {result.message ? (
                  <div className="metadata-item">
                    <span className="metadata-label">Message</span>
                    <span className="metadata-value">{result.message}</span>
                  </div>
                ) : null}
                <div className="metadata-item">
                  <span className="metadata-label">Review item ID</span>
                  <span className="metadata-value">
                    <code>{result.reviewItemId}</code>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="surface-card surface-card--muted">
              <span className="card-kicker">Latest result</span>
              <h2 className="card-title">No ingest submitted yet.</h2>
              <p className="card-body">
                When you create a review item, the parsed result will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
