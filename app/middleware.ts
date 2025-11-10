import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const PROTECTED_ROUTES = new Set(["/"]);
const TOKEN_COOKIE = "auth-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get(TOKEN_COOKIE)?.value ??
    request.cookies.get("accessToken")?.value;

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isProtectedRoute =
    PROTECTED_ROUTES.has(pathname) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/app");

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/app/:path*"],
};

