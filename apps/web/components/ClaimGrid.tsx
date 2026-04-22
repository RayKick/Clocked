import React from "react";
import Link from "next/link";
import { ClaimCard } from "@clocked/ui";
import type { ProjectRecordClaim } from "@clocked/core";

export function ClaimGrid({ claims }: { claims: ProjectRecordClaim[] }) {
  if (claims.length === 0) {
    return <div className="panel">No public claims in this section yet.</div>;
  }

  return (
    <div className="card-grid">
      {claims.map((claim) => (
        <Link key={claim.id} href={`/c/${claim.publicSlug}`} className="card-link">
          <ClaimCard
            slug={claim.publicSlug}
            status={claim.status}
            normalizedClaim={claim.normalizedClaim}
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
