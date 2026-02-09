import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect admin routes
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Let non-admin routes through immediately
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Skip auth in development
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // Admin protection logic (only runs for admin routes in production)
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return new NextResponse("Admin locked", { status: 401 });
  }

  const auth = req.headers.get("authorization");

  if (!auth) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const [scheme, encoded] = auth.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return new NextResponse("Invalid auth", { status: 401 });
  }

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [u, p] = decoded.split(":");

  if (u !== user || p !== pass) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};