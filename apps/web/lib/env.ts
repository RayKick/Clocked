export function getAppBaseUrl(): string {
  return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

export function getAdminPasswordFromRequest(request: Request): string | null {
  const header = request.headers.get("x-admin-password");
  if (header) {
    return header;
  }

  return null;
}

export async function requireAdmin(request: Request, fallbackBody?: FormData | URLSearchParams) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return;
  }

  const password =
    getAdminPasswordFromRequest(request) ??
    fallbackBody?.get("adminPassword")?.toString() ??
    new URL(request.url).searchParams.get("adminPassword");

  if (password !== configured) {
    throw new Error("Unauthorized");
  }
}

