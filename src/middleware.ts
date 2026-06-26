import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "mw_session";

const PROTECTED = ["/dashboard"];
const ADMIN = ["/admin"];
const MEMBER_ONLY = ["/contact"];
const AUTH_REQUIRED = ["/giveaways", "/tickets", "/meet-and-greet"];

function requiresAuth(pathname: string) {
  return AUTH_REQUIRED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function loginWithRedirect(request: NextRequest, pathname: string) {
  const login = new URL("/login", request.url);
  login.searchParams.set("redirect", pathname);
  return NextResponse.redirect(login);
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      id: string;
      role: string;
      membership_tier: string;
      membership_status: string;
    };
  } catch {
    return null;
  }
}

function hasMembership(session: { membership_status: string; membership_tier: string }) {
  return session.membership_status === "approved" && session.membership_tier !== "none";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (pathname.startsWith("/dashboard/messages") && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/messages", request.url));
  }

  if (requiresAuth(pathname)) {
    if (!session) {
      return loginWithRedirect(request, pathname);
    }
  }

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return loginWithRedirect(request, pathname);
    }
  }

  if (ADMIN.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (MEMBER_ONLY.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return loginWithRedirect(request, pathname);
    }
    if (!hasMembership(session)) {
      return NextResponse.redirect(new URL("/dashboard/membership", request.url));
    }
  }

  if ((pathname === "/login" || pathname === "/signup") && session) {
    return NextResponse.redirect(
      new URL(session.role === "admin" ? "/admin" : "/dashboard", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/contact",
    "/login",
    "/signup",
    "/giveaways",
    "/giveaways/:path*",
    "/tickets",
    "/tickets/:path*",
    "/meet-and-greet",
    "/meet-and-greet/:path*",
  ],
};

