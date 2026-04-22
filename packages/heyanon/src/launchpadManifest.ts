export function createLaunchpadManifest() {
  return {
    name: "CLOCKED",
    description:
      "HeyAnon-native public receipts agent for crypto promises, deadlines, evidence, and delivery records.",
    category: "Public receipts / accountability / research infrastructure",
    surfaces: ["X bot", "web app", "MCP server", "HeyAnon agent", "HUD export"],
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
      "Public X data via official API",
      "CLOCKED PostgreSQL records",
      "Optional HeyAnon adapters",
      "Optional Gemma enrichment",
      "Official GitHub/GitBook public sources where configured"
    ],
    safetyPolicy: [
      "Neutral evidence-based copy only",
      "No liar score or harassment framing",
      "Human review by default for public replies and status changes",
      "No live writes or live HeyAnon calls unless env-enabled"
    ],
    dryRunStatus: true,
    contact: {
      project: "CLOCKED",
      baseUrl: process.env.APP_BASE_URL ?? "http://localhost:3000"
    }
  };
}

