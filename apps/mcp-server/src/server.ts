import { createMcpManifest } from "@clocked/heyanon";
import { prisma } from "@clocked/db";

import { authorizeRequest } from "./auth";
import { getActorRecordTool } from "./tools/getActorRecord";
import { createClaimDraftTool } from "./tools/createClaimDraft";
import { evaluateClaimStatusTool } from "./tools/evaluateClaimStatus";
import { extractClaimFromTextTool } from "./tools/extractClaimFromText";
import { getClaimTool } from "./tools/getClaim";
import { getDueClaimsTool } from "./tools/getDueClaims";
import { getProjectRecordTool } from "./tools/getProjectRecord";
import { getWeeklyDigestTool } from "./tools/getWeeklyDigest";
import { searchClaimsTool } from "./tools/searchClaims";
import { submitEvidenceTool } from "./tools/submitEvidence";

const toolMap = {
  "clocked.search_claims": searchClaimsTool,
  "clocked.get_claim": getClaimTool,
  "clocked.get_project_record": getProjectRecordTool,
  "clocked.get_actor_record": getActorRecordTool,
  "clocked.get_due_claims": getDueClaimsTool,
  "clocked.extract_claim_from_text": extractClaimFromTextTool,
  "clocked.create_claim_draft": createClaimDraftTool,
  "clocked.evaluate_claim_status": evaluateClaimStatusTool,
  "clocked.submit_evidence": submitEvidenceTool,
  "clocked.get_weekly_digest": getWeeklyDigestTool
} as const;

function getErrorStatus(error: unknown): number {
  if (!(error instanceof Error)) {
    return 500;
  }

  const message = error.message.toLowerCase();
  if (
    message.includes("authentication failed against database server") ||
    message.includes("can't reach database server") ||
    (message.includes("database") && message.includes("unavailable"))
  ) {
    return 503;
  }

  return 400;
}

async function logInvocationSafe(input: {
  toolName: string;
  inputJson: unknown;
  outputJson?: unknown;
  status: "SUCCESS" | "FAILED";
  error?: string;
}): Promise<void> {
  try {
    await prisma.mcpInvocation.create({
      data: {
        toolName: input.toolName,
        inputJson: input.inputJson as never,
        outputJson: input.outputJson as never,
        callerType: "EXTERNAL",
        status: input.status,
        error: input.error
      }
    });
  } catch {
    // Keep MCP tools usable even when the DB is unavailable.
  }
}

export async function handleMcpRequest(request: Request): Promise<Response> {
  const auth = authorizeRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.reason }, { status: 401 });
  }

  const url = new URL(request.url);

  if (url.pathname === "/health") {
    return Response.json({ ok: true });
  }

  if (url.pathname === "/manifest") {
    return Response.json(createMcpManifest());
  }

  if (url.pathname === "/tools" && request.method === "POST") {
    const body = (await request.json()) as { tool: keyof typeof toolMap; input: unknown };
    const tool = toolMap[body.tool];
    if (!tool) {
      return Response.json({ error: "Unknown tool" }, { status: 404 });
    }

    try {
      const output = await tool(body.input);
      await logInvocationSafe({
        toolName: body.tool,
        inputJson: body.input,
        outputJson: output,
        status: "SUCCESS"
      });
      return Response.json(output);
    } catch (error) {
      await logInvocationSafe({
        toolName: body.tool,
        inputJson: body.input,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: getErrorStatus(error) }
      );
    }
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
