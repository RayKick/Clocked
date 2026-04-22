export function authorizeRequest(request: Request): { ok: boolean; reason?: string } {
  const expected = process.env.MCP_API_KEY;
  if (!expected) {
    return { ok: true };
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== expected) {
    return { ok: false, reason: "Invalid MCP_API_KEY" };
  }

  return { ok: true };
}

