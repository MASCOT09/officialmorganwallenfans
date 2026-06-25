import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { getRepository } from "./repository";

const SESSION_COOKIE = "mw_session";
const BCRYPT_ROUNDS = 8;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    membership_tier: user.membership_tier,
    membership_status: user.membership_status,
    avatar_url: user.avatar_url,
    country: user.country,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as string,
      email: payload.email as string,
      display_name: payload.display_name as string,
      role: payload.role as SessionUser["role"],
      membership_tier: payload.membership_tier as SessionUser["membership_tier"],
      membership_status: payload.membership_status as SessionUser["membership_status"],
      avatar_url: (payload.avatar_url as string | null) ?? null,
      country: payload.country as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}

export async function refreshSessionFromDb(userId: string): Promise<SessionUser | null> {
  const repo = getRepository();
  const user = await repo.getUserById(userId);
  if (!user) return null;
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
    membership_tier: user.membership_tier,
    membership_status: user.membership_status,
    avatar_url: user.avatar_url,
    country: user.country,
  };
  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);
  return sessionUser;
}

const lastSeenCache = new Map<string, number>();

export async function updateLastSeen(userId: string) {
  const now = Date.now();
  const last = lastSeenCache.get(userId) ?? 0;
  if (now - last < 2 * 60 * 1000) return;
  lastSeenCache.set(userId, now);
  const repo = getRepository();
  await repo.updateLastSeen(userId, new Date().toISOString());
}

/** Only allow same-site paths after login/signup (blocks open redirects). */
export function getSafeRedirectPath(
  redirect: string | null | undefined,
  role: SessionUser["role"],
): string {
  if (role === "admin") return "/admin";
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/dashboard";
}
