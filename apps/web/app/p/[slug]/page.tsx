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
        <div className="stats">
          {Object.entries(record.countsByStatus).map(([label, count]) => (
            <span key={label} className="stat">
              {label}: {count}
            </span>
          ))}
        </div>
      </section>
      <SectionShell
        title="Due soon"
        body="Open claims that are approaching a deadline window."
      >
        <ClaimGrid claims={record.dueSoon} />
      </SectionShell>
      <SectionShell title="Open claims">
        <ClaimGrid claims={record.openClaims} />
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
      <SectionShell title="Public record URL">
        <div className="panel">
          <a href={record.publicUrl}>{record.publicUrl}</a>
        </div>
      </SectionShell>
      <SectionShell title="All claims">
        <ClaimGrid claims={record.claims} />
      </SectionShell>
    </PageShell>
  );
}
