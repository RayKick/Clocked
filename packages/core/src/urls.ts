export interface PublicEnv {
  [key: string]: string | undefined;
  APP_BASE_URL?: string;
  WEB_BASE_URL?: string;
  CLOCKED_MCP_BASE_URL?: string;
  MCP_BASE_URL?: string;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getAppBaseUrl(env: PublicEnv = process.env): string {
  return normalizeBaseUrl(env.APP_BASE_URL?.trim() || "http://localhost:3000");
}

export function getWebBaseUrl(env: PublicEnv = process.env): string {
  return normalizeBaseUrl(
    env.WEB_BASE_URL?.trim() || env.APP_BASE_URL?.trim() || "http://localhost:3000"
  );
}

export function getMcpBaseUrl(env: PublicEnv = process.env): string {
  return normalizeBaseUrl(
    env.MCP_BASE_URL?.trim() ||
      env.CLOCKED_MCP_BASE_URL?.trim() ||
      "http://localhost:8787"
  );
}
