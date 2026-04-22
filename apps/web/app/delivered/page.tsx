import { SectionShell } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getClaims } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function DeliveredPage() {
  const claims = await getClaims({ status: "DELIVERED", limit: 24 });
  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Delivered receipts</span>
        <h1>Claims with public delivery proof.</h1>
      </section>
      <SectionShell title="Delivered">
        <ClaimGrid claims={claims} />
      </SectionShell>
    </PageShell>
  );
}
