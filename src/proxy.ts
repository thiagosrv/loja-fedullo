import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "fedullo-admin-jwt-secret-2025-fallback"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  const isValid = token
    ? await jwtVerify(token, SECRET).then(() => true).catch(() => false)
    : false;

  if (isLoginPage) {
    if (isValid) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!isValid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
