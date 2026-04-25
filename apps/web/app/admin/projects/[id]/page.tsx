import { notFound } from "next/navigation";

import { PageShell } from "../../../../components/PageShell";
import { getHudPayload } from "../../../../lib/data";
import { prisma } from "@clocked/db";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    notFound();
  }

  const hud = await getHudPayload(project.slug);

  return (
    <PageShell>
      <section className="hero">
        <span className="tab">Project admin</span>
        <h1>{project.name}</h1>
      </section>
      <div className="panel">
        <h3>HUD preview</h3>
        <pre>{JSON.stringify(hud, null, 2)}</pre>
      </div>
    </PageShell>
  );
}
