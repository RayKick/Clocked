export function authorizeRequest(request: Request): { ok: boolean; reason?: string } {
  const expected = process.env.MCP_API_KEY;
  if (!expected) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      return { ok: false, reason: "MCP_API_KEY is required in production." };
    }

    return { ok: true };
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== expected) {
    return { ok: false, reason: "Invalid MCP_API_KEY" };
  }

  return { ok: true };
}
