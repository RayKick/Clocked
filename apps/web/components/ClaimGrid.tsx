import Link from "next/link";
import { ClaimCard } from "@clocked/ui";
import type { ProjectRecordClaim } from "@clocked/core";

export function ClaimGrid({ claims }: { claims: ProjectRecordClaim[] }) {
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

