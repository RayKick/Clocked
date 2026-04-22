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
        <p>Due today, due this week, and overdue claims pending review.</p>
      </section>
      <SectionShell title="Due today">
        <ClaimGrid claims={buckets.today} />
      </SectionShell>
      <SectionShell title="Due this week">
        <ClaimGrid claims={buckets.thisWeek} />
      </SectionShell>
      <SectionShell title="Overdue pending review">
        <ClaimGrid claims={buckets.overdue} />
      </SectionShell>
    </PageShell>
  );
}
