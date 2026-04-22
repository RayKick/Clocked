import { getAppBaseUrl } from "@clocked/core";

export function createLaunchpadManifest() {
  return {
    name: "CLOCKED",
    description:
      "Dry-run public receipts agent for crypto promises, deadlines, evidence, and delivery records.",
    category: "Public receipts / accountability / research infrastructure",
    surfaces: [
      "web app",
      "admin review",
      "public claim pages",
      "MCP server",
      "HUD export",
      "future X trigger flow"
    ],
    toolsExposed: [
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
    ],
    dataSourcesUsed: [
      "Public X data via official API wrappers",
      "CLOCKED PostgreSQL records",
      "Mocked HeyAnon adapters",
      "Mocked Gemma enrichment",
      "Official GitHub/GitBook public sources where configured"
    ],
    safetyPolicy: [
      "SAFE_DRY_RUN=true by default",
      "Neutral evidence-based copy only",
      "No trust score, liar score, or harassment framing",
      "Human review by default for public replies and status changes",
      "No live external writes by default",
      "HeyAnon and Gemma live calls stay disabled until env-enabled and endpoints are confirmed"
    ],
    dryRunStatus: true,
    mockedSurfaces: [
      "X posting",
      "HeyAnon live calls",
      "Gemma live calls",
      "AI in normal test runs"
    ],
    contact: {
      project: "CLOCKED",
      baseUrl: getAppBaseUrl(process.env)
    }
  };
}
