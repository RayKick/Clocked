import React from "react";
import { SectionShell } from "@clocked/ui";

import { AdminReviewCard } from "../../../components/AdminReviewCard";
import { PageShell } from "../../../components/PageShell";
import { getAdminReviewItems } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const adminPassword =
    typeof params.password === "string" ? params.password : undefined;
  const reviewItems = await getAdminReviewItems();

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Dry-run safety</span>
        <h1>Admin review queue</h1>
        <p>
          Dry-run mode: approvals create local records only. X posting and live
          HeyAnon/Gemma calls are disabled.
        </p>
      </section>
      <SectionShell
        eyebrow="Pending"
        title="Admin review queue"
        body="Approving CLAIM_CREATE turns a reviewed draft into a public claim and creates a draft bot reply. Approval does not post externally."
      >
        <div className="card-grid">
          {reviewItems.map((item) => (
            <AdminReviewCard
              key={item.id}
              reviewItem={item}
              adminPassword={adminPassword}
            />
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
