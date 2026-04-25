import React from "react";
import Link from "next/link";
import { ClaimCard } from "@clocked/ui";
import type { ProjectRecordClaim } from "@clocked/core";

export function ClaimGrid(props: {
  claims: ProjectRecordClaim[];
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const {
    claims,
    emptyTitle = "Nothing public in this section yet.",
    emptyBody = "New reviewed claims will appear here once they are ready for the public record."
  } = props;

  if (claims.length === 0) {
    return (
      <div className="empty-state">
        <strong className="empty-state-title">{emptyTitle}</strong>
        <p className="empty-state-body">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {claims.map((claim) => (
        <Link key={claim.id} href={`/c/${claim.publicSlug}`} className="card-link">
          <ClaimCard
            slug={claim.publicSlug}
            status={claim.status}
            normalizedClaim={claim.normalizedClaim}
            sourceQuote={claim.sourceQuote}
            evidenceRequired={claim.deliverable}
            sourceLabel={claim.sourcePost.platform}
            receiptId={`REC-${claim.id.slice(-6).toUpperCase()}`}
            projectName={claim.project?.name}
            actorHandle={claim.actor?.handle}
            deadlineText={claim.deadlineText}
            deadlineAt={claim.deadlineAt?.toISOString()}
          />
        </Link>
      ))}
    </div>
  );
}
