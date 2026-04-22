import { SectionShell } from "@clocked/ui";
import { notFound } from "next/navigation";

import { ClaimGrid } from "../../../../components/ClaimGrid";
import { PageShell } from "../../../../components/PageShell";
import { getActorRecordByHandle } from "../../../../lib/data";

export const dynamic = "force-dynamic";

export default async function ActorPage({
  params
}: {
  params: Promise<{ platform: string; handle: string }>;
}) {
  const { platform, handle } = await params;
  const record = await getActorRecordByHandle(platform.toUpperCase() as never, handle);

  if (!record) {
    notFound();
  }

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">{record.actor.platform}</span>
        <h1>@{record.actor.handle}</h1>
        {record.actor.displayName ? <p>{record.actor.displayName}</p> : null}
        <p>
          {record.actor.actorType} · {record.actor.verifiedSource ? "Verified source" : "Unverified source"}
        </p>
        <p>{record.factualSummary}</p>
        <p>
          This page lists public claims attributed to this actor or linked
          project sources.
        </p>
      </section>
      <SectionShell title="Associated projects">
        <div className="stats">
          {record.associatedProjects.map((project: { id: string; name: string }) => (
            <span key={project.id} className="stat">
              {project.name}
            </span>
          ))}
        </div>
      </SectionShell>
      <SectionShell title="Status counts">
        <div className="stats">
          {Object.entries(record.countsByStatus).map(([label, count]) => (
            <span key={label} className="stat">
              {label}: {count}
            </span>
          ))}
        </div>
      </SectionShell>
      <SectionShell title="Public actor record URL">
        <div className="panel">
          <a href={record.publicUrl}>{record.publicUrl}</a>
        </div>
      </SectionShell>
      <SectionShell title="Claim history">
        <ClaimGrid claims={record.latestClaims} />
      </SectionShell>
    </PageShell>
  );
}
