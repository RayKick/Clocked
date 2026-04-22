import { SectionShell } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getDueBuckets } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function DuePage() {
  const buckets = await getDueBuckets();

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Due digest</span>
        <h1>Claims on the clock.</h1>
        <p>Due today, due this week, overdue pending review, and recent outcomes.</p>
        <p>{buckets.digest}</p>
      </section>
      <SectionShell title="Due today">
        <ClaimGrid claims={buckets.today} />
      </SectionShell>
      <SectionShell title="Due this week">
        <ClaimGrid claims={buckets.thisWeek} />
      </SectionShell>
      <SectionShell title="Overdue pending review" body="Open claims whose deadlines have passed and may need a reviewed status update.">
        <ClaimGrid claims={buckets.overdue} />
      </SectionShell>
      <SectionShell title="Recently delivered">
        <ClaimGrid claims={buckets.recentlyDelivered} />
      </SectionShell>
      <SectionShell title="Recently reframed">
        <ClaimGrid claims={buckets.recentlyReframed} />
      </SectionShell>
    </PageShell>
  );
}
