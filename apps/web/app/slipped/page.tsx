import { SectionShell } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getClaims } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function SlippedPage() {
  const claims = await getClaims({ status: "SLIPPED", limit: 24 });
  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Slipped receipts</span>
        <h1>Deadlines that passed pending delivery proof.</h1>
      </section>
      <SectionShell title="Slipped">
        <ClaimGrid claims={claims} />
      </SectionShell>
    </PageShell>
  );
}
