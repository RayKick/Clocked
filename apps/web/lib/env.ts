import { getAppBaseUrl as getConfiguredAppBaseUrl } from "@clocked/core";

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function getAppBaseUrl(): string {
  const vercelBaseUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return getConfiguredAppBaseUrl({
    ...process.env,
    APP_BASE_URL:
      process.env.APP_BASE_URL ??
      (vercelBaseUrl ? `https://${vercelBaseUrl.replace(/^https?:\/\//, "")}` : undefined)
  });
}

export function isSafeDryRunEnabled(): boolean {
  return process.env.SAFE_DRY_RUN !== "false";
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function isAdminQueryPasswordAllowed(): boolean {
  return process.env.ALLOW_ADMIN_QUERY_PASSWORD === "true";
}

export function isXReadEnabled(): boolean {
  return process.env.X_READ_ENABLED === "true";
}

export function isXPostingEnabled(): boolean {
  return process.env.X_POSTING_ENABLED === "true";
}

export function isHeyAnonLiveCallsEnabled(): boolean {
  return process.env.HEYANON_ENABLE_LIVE_CALLS === "true";
}

export function shouldRequireAdminPassword(): boolean {
  return !isSafeDryRunEnabled() || isAdminPasswordConfigured();
}

export function getAdminUiState() {
  const safeDryRun = isSafeDryRunEnabled();
  const adminPasswordConfigured = isAdminPasswordConfigured();
  const passwordRequired = shouldRequireAdminPassword();
  const queryPasswordAllowed = isAdminQueryPasswordAllowed();

  if (!passwordRequired) {
    return {
      safeDryRun,
      adminPasswordConfigured,
      passwordRequired,
      queryPasswordAllowed,
      bannerTitle: "Local dry-run admin mode",
      bannerBody: "Set ADMIN_PASSWORD before deploying. Approvals create local records only."
    };
  }

  return {
    safeDryRun,
    adminPasswordConfigured,
    passwordRequired,
    queryPasswordAllowed,
    bannerTitle: "Admin protection enabled",
    bannerBody: queryPasswordAllowed
      ? "Admin mutations require ADMIN_PASSWORD. Use x-clocked-admin-password for API calls. Local query/form password fallback is enabled only because ALLOW_ADMIN_QUERY_PASSWORD=true."
      : "Admin mutations require ADMIN_PASSWORD. Use x-clocked-admin-password for API calls. Query/form password fallback is disabled by default for staging safety."
  };
}

export function getAdminPasswordFromRequest(request: Request): string | null {
  const header =
    request.headers.get("x-clocked-admin-password") ??
    request.headers.get("x-admin-password");
  if (header) {
    return header;
  }

  return null;
}

export function getAdminPasswordFromFallback(
  request: Request,
  fallbackBody?: FormData | URLSearchParams
): string | null {
  if (!isAdminQueryPasswordAllowed()) {
    return null;
  }

  return (
    fallbackBody?.get("adminPassword")?.toString() ??
    fallbackBody?.get("password")?.toString() ??
    new URL(request.url).searchParams.get("adminPassword") ??
    new URL(request.url).searchParams.get("password")
  );
}

export async function requireAdmin(request: Request, fallbackBody?: FormData | URLSearchParams) {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!shouldRequireAdminPassword()) {
    return;
  }

  const password =
    getAdminPasswordFromRequest(request) ??
    getAdminPasswordFromFallback(request, fallbackBody);

  if (!configured || password !== configured) {
    throw new AdminAuthError();
  }
}

export function getRuntimeSafetyConfig() {
  return {
    safeDryRun: isSafeDryRunEnabled(),
    xReadEnabled: isXReadEnabled(),
    xPostingEnabled: isXPostingEnabled(),
    heyAnonLiveCallsEnabled: isHeyAnonLiveCallsEnabled(),
    appBaseUrlConfigured: Boolean(
      process.env.APP_BASE_URL?.trim() ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
        process.env.VERCEL_URL?.trim()
    ),
    adminPasswordConfigured: isAdminPasswordConfigured(),
    allowAdminQueryPassword: isAdminQueryPasswordAllowed()
  };
}
