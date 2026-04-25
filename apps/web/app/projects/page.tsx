import React from "react";
import Link from "next/link";
import { countClaimsByStatus, dueSoonClaims, getPublicStatusLabel, type ProjectRecordClaim } from "@clocked/core";
import { SectionShell, StatusBadge, StatCard } from "@clocked/ui";

import { PageShell } from "../../components/PageShell";
import { getClaims } from "../../lib/data";
import { formatShortDate } from "../../lib/format";

export const dynamic = "force-dynamic";

type ProjectSummary = {
  slug: string;
  name: string;
  description?: string | null;
  officialXHandle?: string | null;
  claims: ProjectRecordClaim[];
  latestClaim: ProjectRecordClaim;
  isExampleOnly: boolean;
};

function summarizeProjects(claims: ProjectRecordClaim[]): ProjectSummary[] {
  const projects = new Map<string, ProjectSummary>();

  for (const claim of claims) {
    if (!claim.project) continue;

    const existing = projects.get(claim.project.slug);
    if (existing) {
      existing.claims.push(claim);
      if (claim.updatedAt > existing.latestClaim.updatedAt) {
        existing.latestClaim = claim;
      }
      existing.isExampleOnly = existing.claims.every((item) => item.id.startsWith("sample-"));
      continue;
    }

    projects.set(claim.project.slug, {
      slug: claim.project.slug,
      name: claim.project.name,
      description: claim.project.description,
      officialXHandle: claim.project.officialXHandle,
      claims: [claim],
      latestClaim: claim,
      isExampleOnly: claim.id.startsWith("sample-")
    });
  }

  return [...projects.values()].sort((a, b) => {
    if (a.isExampleOnly !== b.isExampleOnly) {
      return a.isExampleOnly ? 1 : -1;
    }

    return b.latestClaim.updatedAt.getTime() - a.latestClaim.updatedAt.getTime();
  });
}

export default async function ProjectsPage() {
  const claims = await getClaims({ limit: 200 });
  const projects = summarizeProjects(claims);
  const realProjects = projects.filter((project) => !project.isExampleOnly).length;
  const exampleProjects = projects.length - realProjects;

  return (
    <PageShell>
      <section className="hero reveal">
        <span className="eyebrow">Project records</span>
        <h1>Records grouped by project.</h1>
        <p className="hero-lead">
          Each project page collects source-linked promises, deadlines, evidence, and
          reviewed outcomes without turning the record into a scorecard.
        </p>
      </section>

      <div className="stats-grid reveal-delayed">
        <StatCard label="Projects" value={projects.length} detail="Projects with at least one receipt." tone="accent" />
        <StatCard label="Public records" value={realProjects} detail="Projects backed by reviewed non-example records." tone="success" />
        <StatCard label="Example projects" value={exampleProjects} detail="Marked product-preview records." tone="warning" />
        <StatCard label="Receipts" value={claims.length} detail="Total records visible in this view." />
      </div>

      {exampleProjects > 0 ? (
        <div className="sample-notice" role="note">
          <strong>Example projects are marked.</strong>
          <span>
            Real reviewed project records sort first. Example records are included to show the product loop.
          </span>
        </div>
      ) : null}

      <SectionShell
        title="Projects"
        body="Open a project to see its receipts, status mix, related actors, and latest status activity."
      >
        {projects.length > 0 ? (
          <div className="project-index-grid">
            {projects.map((project) => {
              const counts = countClaimsByStatus(project.claims);
              const dueSoon = dueSoonClaims(project.claims).length;

              return (
                <Link
                  key={project.slug}
                  href={`/p/${project.slug}`}
                  className="surface-card surface-card--interactive project-index-card"
                >
                  <div className="project-index-card-top">
                    <div className="project-lockup">
                      <span className="project-mark">{project.name.slice(0, 1)}</span>
                      <div>
                        <strong>{project.name}</strong>
                        <small>
                          {project.officialXHandle ? `@${project.officialXHandle}` : "Public project record"}
                        </small>
                      </div>
                    </div>
                    {project.isExampleOnly ? (
                      <span className="record-kind-badge">Example</span>
                    ) : (
                      <StatusBadge status={project.latestClaim.status} />
                    )}
                  </div>
                  <p className="card-body">
                    {project.description ??
                      "Source-linked delivery claims, deadlines, and reviewed outcomes."}
                  </p>
                  <div className="project-metrics">
                    <span>{project.claims.length} receipts</span>
                    <span>{counts.OPEN} open</span>
                    <span>{counts.DELIVERED} delivered</span>
                    <span>{counts.SLIPPED} slipped</span>
                    <span>{dueSoon} due soon</span>
                  </div>
                  <div className="receipt-card-rows">
                    <div>
                      <span>Latest claim</span>
                      <strong>{project.latestClaim.normalizedClaim}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{getPublicStatusLabel(project.latestClaim.status)}</strong>
                      <small>Updated {formatShortDate(project.latestClaim.updatedAt)}</small>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <strong className="empty-state-title">No project records yet.</strong>
            <p className="empty-state-body">
              Reviewed receipts will create project records automatically.
            </p>
          </div>
        )}
      </SectionShell>
    </PageShell>
  );
}
