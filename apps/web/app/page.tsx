import React from "react";
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
        <h1>Public receipts for crypto promises.</h1>
        <p>
          CLOCKED turns time-bounded public promises into trackable claims with
          deadlines, evidence, and status history.
        </p>
        <p>
          Tag @ClockedBot under a concrete crypto promise with a deadline.
          CLOCKED turns it into a public receipt after review.
        </p>
        <p>
          Built as a public memory layer for humans on X and agents through MCP.
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
        <div className="tabs">
          <Link href="/p/example-protocol" className="tab">
            View Example Protocol record
          </Link>
          <Link href="/admin/review" className="tab">
            Open admin review
          </Link>
          <Link href="/due" className="tab">
            View due claims
          </Link>
          <a href="/api/hud/project/example-protocol" className="tab">
            HUD export
          </a>
        </div>
      </section>
      <SectionShell
        eyebrow="Demo"
        title="How CLOCKED looks in practice"
        body="Three quick examples: a live receipt, a delivered record, and a statement that stays out of the public record because it is too vague."
      >
        <div className="card-grid">
          <article className="panel">
            <div className="stats">
              <span className="stat">CLOCKED</span>
              <span className="stat">Open</span>
            </div>
            <h3 style={{ margin: 0 }}>Example Protocol will ship V2 next week.</h3>
            <p style={{ margin: "0.6rem 0", opacity: 0.84 }}>
              Concrete claim, bounded deadline, and public criteria preserved.
            </p>
            <Link href="/c/example-protocol-will-ship-v2-next-week">
              View receipt
            </Link>
          </article>
          <article className="panel">
            <div className="stats">
              <span className="stat">DELIVERED</span>
              <span className="stat">Delivered</span>
            </div>
            <h3 style={{ margin: 0 }}>
              Example Protocol published its audit report by Friday.
            </h3>
            <p style={{ margin: "0.6rem 0", opacity: 0.84 }}>
              Public delivery evidence is recorded alongside the original claim.
            </p>
            <Link href="/p/example-protocol">View delivery record</Link>
          </article>
          <article className="panel">
            <div className="stats">
              <span className="stat">NOT CLOCKABLE</span>
            </div>
            <h3 style={{ margin: 0 }}>Big things coming soon.</h3>
            <p style={{ margin: "0.6rem 0", opacity: 0.84 }}>
              Missing concrete deliverable and bounded deadline.
            </p>
            <Link href="/due">Learn claim policy</Link>
          </article>
        </div>
      </SectionShell>
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
