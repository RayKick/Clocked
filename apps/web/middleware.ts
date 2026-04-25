import { NextResponse, type NextRequest } from "next/server";

function isHostedProduction() {
  return process.env.VERCEL_ENV === "production";
}

function shouldProtectAdminUi() {
  return (
    isHostedProduction() ||
    process.env.CLOCKED_ADMIN_UI_PROTECTION === "required" ||
    process.env.ADMIN_PASSWORD?.trim()
  );
}

function getBasicPassword(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    return separator >= 0 ? decoded.slice(separator + 1) : decoded;
  } catch {
    return null;
  }
}

function unauthorized() {
  return new NextResponse("Admin authentication required.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="CLOCKED Admin"'
    }
  });
}

export function middleware(request: NextRequest) {
  if (!shouldProtectAdminUi()) {
    return NextResponse.next();
  }

  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!configuredPassword) {
    return new NextResponse("Admin UI is unavailable until ADMIN_PASSWORD is configured.", {
      status: 503
    });
  }

  const providedPassword =
    request.headers.get("x-clocked-admin-password") ??
    request.headers.get("x-admin-password") ??
    getBasicPassword(request.headers.get("authorization"));

  if (providedPassword !== configuredPassword) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
