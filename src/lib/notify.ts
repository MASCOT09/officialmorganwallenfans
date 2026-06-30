import { v4 as uuidv4 } from "uuid";
import { getRepository } from "./repository";
import {
  sendBroadcastEmail,
  sendGiveawayEmail,
  sendEventEmail,
  sendMembershipApplicationAlert,
  sendMembershipUpgradeEmail,
  sendNewMessageAlert,
} from "./email";
import { sendPushToAdmins, sendPushToAllFans, sendPushToUser, sendPushToUsers } from "./push";
import { MEMBERSHIP_TIERS } from "./membership";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  link?: string,
) {
  const repo = getRepository();
  await repo.createNotification({
    id: uuidv4(),
    user_id: userId,
    title,
    body,
    link: link ?? null,
    is_read: false,
  });
  await sendPushToUser(userId, { title, body, url: link ?? `${SITE_URL}/dashboard/notifications` });
}

export async function notifyAdmins(title: string, body: string, link?: string) {
  const repo = getRepository();
  const admins = await repo.getAllAdmins();
  for (const admin of admins) {
    await repo.createNotification({
      id: uuidv4(),
      user_id: admin.id,
      title,
      body,
      link: link ?? null,
      is_read: false,
    });
  }
  await sendPushToAdmins({ title, body, url: link ?? `${SITE_URL}/admin` });
}

export async function notifyAllFans(title: string, body: string, link?: string) {
  const repo = getRepository();
  const fans = await repo.getAllFans();
  for (const fan of fans) {
    await repo.createNotification({
      id: uuidv4(),
      user_id: fan.id,
      title,
      body,
      link: link ?? null,
      is_read: false,
    });
  }
  await sendPushToAllFans({ title, body, url: link ?? `${SITE_URL}/dashboard` });
}

export async function notifyFanNewMessage(
  fanId: string,
  fanEmail: string,
  fanName: string,
  threadId?: string,
) {
  const link = threadId
    ? `${SITE_URL}/dashboard/messages/${threadId}`
    : `${SITE_URL}/dashboard/messages`;

  await notifyUser(
    fanId,
    "New message from the team",
    "You have a new reply in your inbox.",
    link,
  );

  await sendNewMessageAlert(fanEmail, fanName, false, threadId);
}

export async function notifyAdminsNewMessage(fanName: string) {
  const repo = getRepository();
  await notifyAdmins("New fan message", `${fanName} sent a new message.`, `${SITE_URL}/admin/messages`);
  const admins = await repo.getAllAdmins();
  for (const admin of admins) {
    await sendNewMessageAlert(admin.email, admin.display_name, true);
  }
}

export async function notifyMembershipDecision(
  userId: string,
  email: string,
  name: string,
  approved: boolean,
  tier: string,
) {
  const title = approved ? "Membership approved!" : "Membership application update";
  const body = approved
    ? `Your ${MEMBERSHIP_TIERS[tier as keyof typeof MEMBERSHIP_TIERS]?.label ?? tier} membership has been approved.`
    : "Your membership application was not approved at this time.";
  await notifyUser(userId, title, body, `${SITE_URL}/dashboard/membership`);
  if (approved) {
    await sendMembershipUpgradeEmail(email, name, tier);
  }
}

export async function notifyNewGiveaway(title: string) {
  const repo = getRepository();
  await notifyAllFans("New giveaway live!", title, `${SITE_URL}/giveaways`);
  const fans = await repo.getAllFans();
  for (const fan of fans) {
    await sendGiveawayEmail(fan.email, fan.display_name, title);
  }
}

export async function notifyNewEvent(title: string) {
  const repo = getRepository();
  await notifyAllFans("New meet & greet event!", title, `${SITE_URL}/meet-and-greet`);
  const fans = await repo.getAllFans();
  for (const fan of fans) {
    await sendEventEmail(fan.email, fan.display_name, title);
  }
}

export async function notifyNewTickets(title: string) {
  await notifyAllFans("Concert tickets on sale!", title, `${SITE_URL}/tickets`);
}

export async function notifyAdminsPendingShows(count: number) {
  const label = count === 1 ? "1 new show" : `${count} new shows`;
  await notifyAdmins(
    "Shows awaiting approval",
    `${label} fetched from Ticketmaster need your review before fans can purchase.`,
    `${SITE_URL}/admin/tickets`,
  );
}

export async function notifyTicketPurchase(
  userId: string,
  fanName: string,
  ticketTitle: string,
  quantity: number,
  totalCents: number,
) {
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    totalCents / 100,
  );
  await notifyUser(
    userId,
    "Ticket order received",
    `Your order for ${quantity} ticket${quantity > 1 ? "s" : ""} to ${ticketTitle} (${price}) is pending confirmation.`,
    `${SITE_URL}/dashboard/tickets`,
  );
  await notifyAdmins(
    "New ticket purchase",
    `${fanName} ordered ${quantity} ticket${quantity > 1 ? "s" : ""} for ${ticketTitle} (${price}).`,
    `${SITE_URL}/admin/tickets`,
  );
}

export async function notifyMembershipApplication(fanName: string, tier: string) {
  await notifyAdmins("New membership application", `${fanName} applied for ${tier}.`, `${SITE_URL}/admin/memberships`);
  await sendMembershipApplicationAlert(fanName, tier);
}

export async function broadcastToFans(
  fanIds: string[],
  subject: string,
  body: string,
  sendNotification: boolean,
) {
  const repo = getRepository();
  for (const fanId of fanIds) {
    const threadId = uuidv4();
    await repo.createMessage({
      id: uuidv4(),
      thread_id: threadId,
      user_id: fanId,
      subject,
      body,
      image_url: null,
      image_urls: null,
      sender_role: "admin",
      is_read: false,
      status: "open",
    });
    if (sendNotification) {
      const fan = await repo.getUserById(fanId);
      if (fan) {
        await notifyUser(fanId, subject, body, `${SITE_URL}/dashboard/messages`);
        await sendBroadcastEmail(fan.email, fan.display_name, subject);
      }
    }
  }
  if (sendNotification) {
    await sendPushToUsers(fanIds, { title: subject, body, url: `${SITE_URL}/dashboard/messages` });
  }
}

export { sendMembershipApplicationAlert, sendMembershipUpgradeEmail };
