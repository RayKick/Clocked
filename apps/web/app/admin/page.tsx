import Link from "next/link";

import { PageShell } from "../../components/PageShell";
import { getAdminSummary } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const summary = await getAdminSummary();
  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Admin</span>
        <h1>Review queue and ops console.</h1>
        <p>Use the review queue for public claim creation, status changes, bot replies, and evidence additions.</p>
      </section>
      <div className="stats">
        <span className="stat">Pending reviews: {summary.pendingReviews}</span>
        <span className="stat">Open claims: {summary.openClaims}</span>
        <span className="stat">Projects: {summary.projects}</span>
        <span className="stat">Actors: {summary.actors}</span>
      </div>
      <div className="stats" style={{ marginTop: "1rem" }}>
        <Link href="/admin/review" className="button">
          Open review queue
        </Link>
        <Link href="/admin/ingest" className="button secondary">
          Read-only X ingest
        </Link>
      </div>
    </PageShell>
  );
}
