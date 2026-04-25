import { notFound } from "next/navigation";

import { PageShell } from "../../../../components/PageShell";
import { prisma } from "@clocked/db";
import {
  getAdminUiState,
  isAdminQueryPasswordAllowed
} from "../../../../lib/env";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminClaimPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const adminPassword = isAdminQueryPasswordAllowed()
    ? typeof query.adminPassword === "string"
      ? query.adminPassword
      : typeof query.password === "string"
        ? query.password
        : undefined
    : undefined;
  const adminUiState = getAdminUiState();
  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { project: true, actor: true, evidences: true, statusEvents: true }
  });

  if (!claim) {
    notFound();
  }

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Claim admin</span>
        <h1>{claim.normalizedClaim}</h1>
        <p>{adminUiState.bannerBody}</p>
      </section>
      <div className="detail-grid">
        <div className="panel">
          <h3>Change status</h3>
          <form
            action={`/api/admin/claims/${claim.id}/status`}
            method="post"
            className="inline-form"
          >
            {adminPassword ? (
              <input type="hidden" name="adminPassword" value={adminPassword} />
            ) : null}
            <input type="hidden" name="redirectTo" value={`/admin/claims/${claim.id}`} />
            <select name="status" defaultValue={claim.status}>
              {["OPEN", "DELIVERED", "SLIPPED", "REFRAMED", "SUPERSEDED", "AMBIGUOUS"].map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                )
              )}
            </select>
            <input type="text" name="reason" placeholder="Reason" required />
            <button type="submit">Create status review</button>
          </form>
        </div>
        <div className="panel">
          <h3>Add evidence</h3>
          <form
            action={`/api/admin/claims/${claim.id}/evidence`}
            method="post"
            className="inline-form"
          >
            {adminPassword ? (
              <input type="hidden" name="adminPassword" value={adminPassword} />
            ) : null}
            <input type="hidden" name="redirectTo" value={`/admin/claims/${claim.id}`} />
            <input type="text" name="summary" placeholder="Evidence summary" required />
            <input type="text" name="url" placeholder="Evidence URL" />
            <button type="submit">Create evidence review</button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
