export function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

export function getAppBaseUrl(env = process.env) {
  return normalizeBaseUrl(env.APP_BASE_URL?.trim() || "http://localhost:3000");
}

export function getWebBaseUrl(env = process.env) {
  return normalizeBaseUrl(
    env.WEB_BASE_URL?.trim() || env.APP_BASE_URL?.trim() || "http://localhost:3000"
  );
}

export function getMcpBaseUrl(env = process.env) {
  return normalizeBaseUrl(
    env.MCP_BASE_URL?.trim() ||
      env.CLOCKED_MCP_BASE_URL?.trim() ||
      "http://localhost:8787"
  );
}
