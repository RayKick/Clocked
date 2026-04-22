import { JsonBlock, SectionShell, StatusBadge } from "@clocked/ui";
import { notFound } from "next/navigation";

import { PageShell } from "../../../components/PageShell";
import { formatDisplayDate } from "../../../lib/format";
import { getClaimBySlug } from "../../../lib/data";

export const dynamic = "force-dynamic";

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

  return (
    <PageShell>
      <section className="hero">
        <StatusBadge status={claim.status} />
        <h1>{claim.normalizedClaim}</h1>
        <p>{claim.project?.name ?? "Unassigned project"} · {claim.actor ? `@${claim.actor.handle}` : "Unknown source"}</p>
        <p>{claim.sourceQuote}</p>
      </section>
      <div className="detail-grid">
        <SectionShell title="Receipt">
          <div className="panel">
            <ul className="simple-list">
              <li>Project: {claim.project?.name ?? "Unassigned"}</li>
              <li>Source: {claim.actor ? `@${claim.actor.handle}` : "Unknown"}</li>
              <li>Deadline text: {claim.deadlineText}</li>
              <li>Deadline at: {formatDisplayDate(claim.deadlineAt)}</li>
              <li>
                Source link:{" "}
                {claim.sourcePost.url ? (
                  <a href={claim.sourcePost.url}>Original post</a>
                ) : (
                  "Unavailable"
                )}
              </li>
              <li>
                Public JSON:{" "}
                <a href={`/api/public/claims?query=${claim.publicSlug}`}>Search result</a>
              </li>
            </ul>
          </div>
          <div className="panel">
            <h3>Delivery criteria</h3>
            <ul className="simple-list">
              {claim.deliveryCriteriaJson.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Non-delivery criteria</h3>
            <ul className="simple-list">
              {claim.nonDeliveryCriteriaJson.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {claim.ambiguityNotesJson.length > 0 ? (
              <>
                <h3>Ambiguity notes</h3>
                <ul className="simple-list">
                  {claim.ambiguityNotesJson.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </SectionShell>
        <SectionShell title="Evidence and status history">
          <div className="panel">
            <h3>Evidence timeline</h3>
            <ul className="timeline">
              {claim.evidence.map((evidence) => (
                <li key={evidence.id}>
                  <strong>{evidence.evidenceType}</strong>: {evidence.summary}
                  {evidence.occurredAt ? ` (${formatDisplayDate(evidence.occurredAt)})` : ""}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h3>Status history</h3>
            <ul className="timeline">
              {claim.statusEvents.map((event) => (
                <li key={event.id}>
                  <strong>{event.toStatus}</strong>: {event.reason} ({formatDisplayDate(event.createdAt)})
                </li>
              ))}
            </ul>
          </div>
          <JsonBlock value={claim.heyAnonContextJson ?? { note: "No HeyAnon context recorded." }} />
        </SectionShell>
      </div>
    </PageShell>
  );
}
