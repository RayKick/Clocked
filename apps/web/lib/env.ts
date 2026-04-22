import { getAppBaseUrl as getConfiguredAppBaseUrl } from "@clocked/core";

export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function getAppBaseUrl(): string {
  return getConfiguredAppBaseUrl(process.env);
}

export function isSafeDryRunEnabled(): boolean {
  return process.env.SAFE_DRY_RUN !== "false";
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function shouldRequireAdminPassword(): boolean {
  return !isSafeDryRunEnabled() || isAdminPasswordConfigured();
}

export function getAdminUiState() {
  const safeDryRun = isSafeDryRunEnabled();
  const adminPasswordConfigured = isAdminPasswordConfigured();
  const passwordRequired = shouldRequireAdminPassword();

  if (!passwordRequired) {
    return {
      safeDryRun,
      adminPasswordConfigured,
      passwordRequired,
      bannerTitle: "Local dry-run admin mode",
      bannerBody: "Set ADMIN_PASSWORD before deploying. Approvals create local records only."
    };
  }

  return {
    safeDryRun,
    adminPasswordConfigured,
    passwordRequired,
    bannerTitle: "Admin protection enabled",
    bannerBody:
      "Admin mutations require ADMIN_PASSWORD. Use x-clocked-admin-password for API calls or ?password= locally when reviewing."
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

export async function requireAdmin(request: Request, fallbackBody?: FormData | URLSearchParams) {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!shouldRequireAdminPassword()) {
    return;
  }

  const password =
    getAdminPasswordFromRequest(request) ??
    fallbackBody?.get("adminPassword")?.toString() ??
    new URL(request.url).searchParams.get("adminPassword");

  if (!configured || password !== configured) {
    throw new AdminAuthError();
  }
}
