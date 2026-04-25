import React from "react";
import { SectionShell } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getClaims } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function SlippedPage() {
  const claims = await getClaims({ status: "SLIPPED", limit: 24 });
  return (
    <PageShell>
      <section className="hero hero--compact reveal">
        <span className="eyebrow">Slipped receipts</span>
        <h1>Deadlines that passed without recorded delivery evidence on time.</h1>
        <p className="hero-lead">
          Slipped receipts preserve the original claim, the deadline, and the public
          record available at review time.
        </p>
      </section>
      <SectionShell title="Slipped" body="Claims whose deadline passed before delivery evidence was recorded.">
        <ClaimGrid
          claims={claims}
          emptyTitle="No slipped receipts yet."
          emptyBody="If a deadline passes without qualifying public evidence, the reviewed record will appear here."
        />
      </SectionShell>
    </PageShell>
  );
}
