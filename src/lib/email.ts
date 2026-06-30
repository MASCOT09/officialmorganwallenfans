import { Resend } from "resend";
import { SITE_NAME, TEAM_NAME } from "./membership";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Morgan Wallen Fan <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DEFAULT_ADMIN_ALERT_EMAIL = "emmanuelolugoke@gmail.com";

function adminAlertRecipients(): string[] {
  const raw = process.env.ADMIN_ALERT_EMAIL ?? DEFAULT_ADMIN_ALERT_EMAIL;
  return raw.split(",").map((e) => e.trim()).filter(Boolean);
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping:", subject);
    return false;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return false;
  }
}

function layout(content: string) {
  return `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#1a2218;color:#F0F3EC;padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#262e22;border:1px solid rgba(122,154,110,0.4);border-radius:12px;padding:32px;">
      <p style="color:#7A9A6E;font-size:12px;letter-spacing:2px;text-transform:uppercase;">${SITE_NAME} Fan Community</p>
      ${content}
      <p style="color:#9AAB8F;font-size:12px;margin-top:32px;">— ${TEAM_NAME}</p>
    </div>
  </body></html>`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail(
    to,
    `Welcome to the ${SITE_NAME} fan community`,
    layout(`
      <h1 style="color:#F0F3EC;">Welcome, ${name}!</h1>
      <p>Thank you for joining the official ${SITE_NAME} fan community. Your account is ready — explore giveaways, events, and exclusive updates from the ${TEAM_NAME}.</p>
      <p><a href="${SITE_URL}/dashboard" style="color:#7A9A6E;">Go to your dashboard →</a></p>
    `),
  );
}

export async function sendAdminSignupAlert(fanEmail: string, fanName: string) {
  return sendEmail(
    adminAlertRecipients(),
    `New member signed up — ${SITE_NAME} Official Fan Site`,
    layout(`
      <h1 style="color:#F0F3EC;">New member signed up</h1>
      <p><strong>${fanName}</strong> (${fanEmail}) just joined the ${SITE_NAME} official fan community.</p>
      <p><a href="${SITE_URL}/admin" style="color:#7A9A6E;">Open admin panel →</a></p>
    `),
  );
}

export async function sendMembershipApplicationAlert(fanName: string, tier: string) {
  return sendEmail(
    adminAlertRecipients(),
    `Membership application: ${fanName} (${tier})`,
    layout(`
      <h1 style="color:#F0F3EC;">New membership application</h1>
      <p><strong>${fanName}</strong> applied for <strong>${tier}</strong> membership.</p>
      <p><a href="${SITE_URL}/admin/memberships" style="color:#7A9A6E;">Review applications →</a></p>
    `),
  );
}

export async function sendMembershipUpgradeEmail(to: string, name: string, tier: string) {
  return sendEmail(
    to,
    `Your ${SITE_NAME} membership has been upgraded`,
    layout(`
      <h1 style="color:#F0F3EC;">Congratulations, ${name}!</h1>
      <p>Your membership has been upgraded to <strong>${tier}</strong>. New perks are now unlocked on your dashboard.</p>
      <p><a href="${SITE_URL}/dashboard/membership" style="color:#7A9A6E;">View membership →</a></p>
    `),
  );
}

export async function sendNewMessageAlert(
  to: string,
  name: string,
  isAdmin: boolean,
  threadId?: string,
) {
  const link = isAdmin
    ? threadId
      ? `${SITE_URL}/admin/messages/${threadId}`
      : `${SITE_URL}/admin/messages`
    : threadId
      ? `${SITE_URL}/dashboard/messages/${threadId}`
      : `${SITE_URL}/dashboard/messages`;
  return sendEmail(
    to,
    `New message from the ${TEAM_NAME}`,
    layout(`
      <h1 style="color:#F0F3EC;">Hi ${name},</h1>
      <p>The ${TEAM_NAME} sent you a new message. Log in to read and reply in your inbox.</p>
      <p><a href="${link}" style="color:#7A9A6E;">Open conversation →</a></p>
    `),
  );
}

export async function sendBroadcastEmail(to: string, name: string, title: string) {
  return sendEmail(
    to,
    title,
    layout(`
      <h1 style="color:#F0F3EC;">Hi ${name},</h1>
      <p>You have a new update from the ${TEAM_NAME}. Log in to your dashboard to read the full message.</p>
      <p><a href="${SITE_URL}/dashboard/messages" style="color:#7A9A6E;">Open dashboard →</a></p>
    `),
  );
}

export async function sendGiveawayEmail(to: string, name: string, title: string) {
  return sendEmail(
    to,
    `New giveaway: ${title}`,
    layout(`
      <h1 style="color:#F0F3EC;">Hi ${name},</h1>
      <p>A new giveaway is live: <strong>${title}</strong>. Enter now from your dashboard!</p>
      <p><a href="${SITE_URL}/giveaways" style="color:#7A9A6E;">View giveaways →</a></p>
    `),
  );
}

export async function sendEventEmail(to: string, name: string, title: string) {
  return sendEmail(
    to,
    `New meet & greet: ${title}`,
    layout(`
      <h1 style="color:#F0F3EC;">Hi ${name},</h1>
      <p>A new meet & greet event is open: <strong>${title}</strong>. Gold+ members can register now.</p>
      <p><a href="${SITE_URL}/meet-and-greet" style="color:#7A9A6E;">View events →</a></p>
    `),
  );
}
