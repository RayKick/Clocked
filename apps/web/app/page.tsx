import Link from "next/link";
import { SectionShell } from "@clocked/ui";

import { ClaimGrid } from "../components/ClaimGrid";
import { PageShell } from "../components/PageShell";
import { getClaims } from "../lib/data";

const tabs = [
  { label: "Open", status: "OPEN" },
  { label: "Delivered", status: "DELIVERED" },
  { label: "Slipped", status: "SLIPPED" },
  { label: "Reframed", status: "REFRAMED" },
  { label: "Ambiguous", status: "AMBIGUOUS" },
  { label: "Due Soon", status: "OPEN", href: "/due" }
];

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const status = typeof params.status === "string" ? params.status : "OPEN";
  const query = typeof params.q === "string" ? params.q : undefined;
  const claims = await getClaims({ status, query, limit: 24 });

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">HeyAnon-native receipts layer</span>
        <h1>Public memory for crypto promises.</h1>
        <p>
          CLOCKED tracks concrete, time-bounded public commitments with source
          quotes, deadline logic, evidence, reviewable status changes, and
          shareable receipts. It is not a harassment bot and it does not issue a
          liar score.
        </p>
        <div className="tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href ?? `/?status=${tab.status}`}
              className="tab"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </section>
      <SectionShell
        eyebrow="Live Feed"
        title={`${status} receipts`}
        body="Neutral, evidence-based public claim cards. Tag @ClockedBot under a concrete crypto promise to create a receipt draft."
      >
        <ClaimGrid claims={claims} />
      </SectionShell>
    </PageShell>
  );
}
