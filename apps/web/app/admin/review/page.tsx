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
      <SectionShell
        eyebrow="Pending"
        title="Admin review queue"
        body="Approving CLAIM_CREATE turns a reviewed draft into a public claim and creates a draft bot reply. All public actions remain safe by default."
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
