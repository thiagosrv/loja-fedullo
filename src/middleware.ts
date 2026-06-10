import { createServerClient } from "@supabase/ssr";
import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

// ─── Admin JWT secret ─────────────────────────────────────────────────────────
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "fedullo-admin-jwt-secret-2025-fallback"
);

async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  return jwtVerify(token, ADMIN_SECRET)
    .then(() => true)
    .catch(() => false);
}

// ─── Customer auth pages / protected routes ───────────────────────────────────
const CUSTOMER_PROTECTED = ["/conta"];
const CUSTOMER_AUTH_PAGES = ["/login", "/cadastro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const isValid = await verifyAdminToken(token);

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

  // ── 2. Customer routes (Supabase auth) ───────────────────────────────────────
  const isProtected = CUSTOMER_PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = CUSTOMER_AUTH_PAGES.includes(pathname);

  // Only run Supabase check when needed (avoids latency on every public request)
  if (!isProtected && !isAuthPage) return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: use getUser() (not getSession()) to validate server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/conta", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
