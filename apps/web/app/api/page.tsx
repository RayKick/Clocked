import React from "react";
import Link from "next/link";
import { SectionShell } from "@clocked/ui";

import { PageShell } from "../../components/PageShell";

const endpoints = [
  {
    method: "GET",
    path: "/api/public/claims",
    body: "Search public receipts by project, actor, status, or text query."
  },
  {
    method: "GET",
    path: "/api/public/projects/[slug]/record",
    body: "Return the same project record shown on public project pages."
  },
  {
    method: "GET",
    path: "/api/public/actors/[platform]/[handle]/record",
    body: "Return neutral actor-linked receipt history without scores or rankings."
  },
  {
    method: "GET",
    path: "/api/hud/project/[slug]",
    body: "Compact HUD export for agent and dashboard surfaces."
  }
];

const mcpTools = [
  "clocked.search_claims",
  "clocked.get_claim",
  "clocked.get_project_record",
  "clocked.get_actor_record",
  "clocked.get_due_claims",
  "clocked.extract_claim_from_text",
  "clocked.create_claim_draft",
  "clocked.evaluate_claim_status",
  "clocked.submit_evidence",
  "clocked.get_weekly_digest"
];

export default function ApiPage() {
  return (
    <PageShell>
      <section className="hero hero--split reveal">
        <div className="hero-copy">
          <span className="eyebrow">API and agents</span>
          <h1>Built for agents, readable by humans.</h1>
          <p className="hero-lead">
            CLOCKED exposes public-safe receipt data through human pages, JSON
            endpoints, HUD exports, and MCP tools. The same record stays aligned
            across every surface.
          </p>
          <div className="hero-actions">
            <a href="/api/public/claims?query=nova-chain" className="button">
              Try claims JSON →
            </a>
            <a href="/api/hud/project/nova-chain" className="button secondary">
              View HUD export ↗
            </a>
          </div>
        </div>
        <div className="hero-side">
          <div className="agent-panel">
            <pre className="code-block">{`GET /api/public/claims?query=nova-chain
GET /api/hud/project/nova-chain

{
  "project": "NovaChain",
  "status": "OPEN",
  "deadline": "2026-05-03T23:59:00Z",
  "source": "source-linked"
}`}</pre>
            <span className="agent-format">JSON</span>
          </div>
        </div>
      </section>

      <SectionShell
        title="Public JSON endpoints"
        body="Read-only public endpoints return neutral receipt data. Admin mutations stay separate and protected."
      >
        <div className="endpoint-grid">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="surface-card endpoint-card">
              <span className="endpoint-method">{endpoint.method}</span>
              <code>{endpoint.path}</code>
              <p>{endpoint.body}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="MCP tools"
        body="Agents can search, inspect, draft, and evaluate records through MCP. Tool access should be authenticated in production."
      >
        <div className="mcp-tool-grid">
          {mcpTools.map((tool) => (
            <code key={tool}>{tool}</code>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        title="Safety posture"
        body="Public reads are designed for transparency. External writes and admin actions remain gated."
      >
        <div className="content-grid content-grid--balanced">
          <div className="surface-card">
            <span className="card-kicker">Public by default</span>
            <p className="card-body">
              Receipt pages, project records, actor records, public claims JSON, and
              HUD exports expose reviewed public-safe data.
            </p>
          </div>
          <div className="surface-card">
            <span className="card-kicker">Gated by default</span>
            <p className="card-body">
              Admin routes, MCP tools in production, live X reads, live X posting,
              and live HeyAnon/Gemma calls remain behind explicit configuration.
            </p>
          </div>
        </div>
      </SectionShell>

      <section className="final-cta reveal">
        <div>
          <h2>Need the raw record?</h2>
          <p>Start with public claims JSON, then inspect the matching receipt page.</p>
        </div>
        <div className="hero-actions">
          <a href="/api/public/claims?query=nova-chain" className="button">
            Open JSON →
          </a>
          <Link href="/methodology" className="button secondary">
            Read methodology →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
