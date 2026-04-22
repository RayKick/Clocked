export function createMcpManifest() {
  return {
    name: "CLOCKED MCP",
    version: "0.1.0",
    description:
      "Public receipts MCP for CLOCKED claims, project records, actor records, due feeds, and safe drafting.",
    tools: [
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
    resources: [
      "clocked://claims/{slug}",
      "clocked://projects/{slug}/delivery-record",
      "clocked://actors/{platform}/{handle}/record",
      "clocked://feeds/due-this-week",
      "clocked://feeds/recent-status-changes"
    ],
    prompts: [
      "clock_this",
      "audit_project_delivery_record",
      "what_did_they_promise",
      "find_reframes"
    ],
    dryRunDefaults: {
      safeDryRun: true,
      xPostingEnabled: false,
      heyanonLiveCallsEnabled: false
    }
  };
}
