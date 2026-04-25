import React from "react";
import { SectionShell } from "@clocked/ui";

import { ClaimGrid } from "../../components/ClaimGrid";
import { PageShell } from "../../components/PageShell";
import { getClaims } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function DeliveredPage() {
  const claims = await getClaims({ status: "DELIVERED", limit: 24 });
  return (
    <PageShell>
      <section className="hero hero--compact reveal">
        <span className="eyebrow">Delivered receipts</span>
        <h1>Claims with recorded public delivery evidence.</h1>
        <p className="hero-lead">
          Delivered receipts keep the original claim and the public evidence in one
          place.
        </p>
      </section>
      <SectionShell title="Delivered" body="Recent delivered outcomes in the public record.">
        <ClaimGrid
          claims={claims}
          emptyTitle="No delivered receipts yet."
          emptyBody="Delivered claims will appear here once public evidence has been reviewed."
        />
      </SectionShell>
    </PageShell>
  );
}
