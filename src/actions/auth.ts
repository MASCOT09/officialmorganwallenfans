"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
  clearSessionCookie,
  verifyPassword,
  getSession,
  getSafeRedirectPath,
} from "@/lib/auth";
import { validateEmail } from "@/lib/email-validation";
import { getRepository } from "@/lib/repository";
import { sendWelcomeEmail, sendAdminSignupAlert } from "@/lib/email";
import { notifyAdmins, notifyUser } from "@/lib/notify";
import { sendPushToAdmins } from "@/lib/push";
import { buildSignupWelcomeMessage, WELCOME_THREAD_SUBJECT } from "@/lib/welcome-message";
import type { SessionUser } from "@/lib/types";

export type ActionResult = { success: boolean; error?: string; suggestion?: string };

export async function signupAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!displayName || displayName.length < 2) {
    return { success: false, error: "Display name must be at least 2 characters." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  if (!country) {
    return { success: false, error: "Please select your country." };
  }

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return { success: false, error: emailCheck.error, suggestion: emailCheck.suggestion };
  }

  const repo = getRepository();
  const existing = await repo.getUserByEmail(email);
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const userId = uuidv4();
  const user = await repo.createUser({
    id: userId,
    email,
    password_hash: passwordHash,
    display_name: displayName,
    role: "fan",
    country,
    avatar_url: null,
    membership_tier: "none",
    membership_status: "none",
  });

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

  const threadId = uuidv4();
  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: userId,
    subject: WELCOME_THREAD_SUBJECT,
    body: buildSignupWelcomeMessage(displayName),
    image_url: null,
    image_urls: null,
    sender_role: "admin",
    is_read: false,
    status: "open",
  });

  await notifyUser(
    userId,
    "Welcome to the fan community!",
    "Your account is ready. Open your inbox to view membership plans and message the team.",
    `/dashboard/messages/${threadId}`,
  );

  after(async () => {
    await sendWelcomeEmail(email, displayName);
    await sendAdminSignupAlert(email, displayName);
    await notifyAdmins("New fan signup", `${displayName} joined the community.`, "/admin");
    await sendPushToAdmins({
      title: "New fan signup",
      body: `${displayName} just joined.`,
      url: "/admin",
    });
  });

  redirect(`/dashboard/messages/${threadId}`);
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const repo = getRepository();
  const user = await repo.getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { success: false, error: "Invalid email or password." };
  }

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

  redirect(getSafeRedirectPath(String(formData.get("redirect") ?? ""), user.role));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export async function getCurrentSession() {
  return getSession();
}
