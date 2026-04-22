import { SectionShell } from "@clocked/ui";
import { notFound } from "next/navigation";

import { ClaimGrid } from "../../../components/ClaimGrid";
import { PageShell } from "../../../components/PageShell";
import { getProjectRecordBySlug } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getProjectRecordBySlug(slug);

  if (!record) {
    notFound();
  }

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Project record</span>
        <h1>{record.project.name}</h1>
        {record.project.description ? <p>{record.project.description}</p> : null}
        {record.project.officialXHandle ? <p>Official X: @{record.project.officialXHandle}</p> : null}
        <p>{record.factualSummary}</p>
        <p>
          This is a factual public record of time-bounded claims associated with
          this project. It is not a trust score.
        </p>
        <div className="stats">
          {Object.entries(record.countsByStatus).map(([label, count]) => (
            <span key={label} className="stat">
              {label}: {count}
            </span>
          ))}
        </div>
      </section>
      <SectionShell
        title="Delivery record"
        body="Counts and recent claim activity are shown without rankings, reputation labels, or accusation language."
      >
        <div className="panel">
          <ul className="simple-list">
            <li>Project: {record.project.name}</li>
            <li>Official X: {record.project.officialXHandle ? `@${record.project.officialXHandle}` : "Not set"}</li>
            <li>Public record URL: <a href={record.publicUrl}>{record.publicUrl}</a></li>
          </ul>
        </div>
      </SectionShell>
      <SectionShell title="Due soon" body="Open claims that are approaching a deadline window.">
        <ClaimGrid claims={record.dueSoon} />
      </SectionShell>
      <SectionShell title="Latest open claims">
        <ClaimGrid claims={record.openClaims.slice(0, 6)} />
      </SectionShell>
      <SectionShell title="Latest delivered">
        <ClaimGrid claims={record.deliveredClaims} />
      </SectionShell>
      <SectionShell title="Latest slipped and reframed">
        <ClaimGrid claims={[...record.slippedClaims, ...record.reframedClaims]} />
      </SectionShell>
      <SectionShell title="Latest status changes">
        <div className="panel">
          <ul className="timeline">
            {record.latestStatusChanges.map((event) => (
              <li key={event.id}>
                <strong>{event.toStatus}</strong>: {event.reason}
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>
      <SectionShell title="All claims">
        <ClaimGrid claims={record.claims} />
      </SectionShell>
    </PageShell>
  );
}
