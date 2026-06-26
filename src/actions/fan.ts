"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import {
  canEnterGiveaways,
  canRegisterMeetAndGreet,
} from "@/lib/membership";
import { notifyAdminsNewMessage, notifyMembershipApplication, notifyTicketPurchase } from "@/lib/notify";
import type { MembershipTier } from "@/lib/types";

export type ActionResult = { success: boolean; error?: string };

export async function applyMembershipAction(tier: MembershipTier): Promise<ActionResult> {
  const session = await requireAuth();
  if (tier === "none") return { success: false, error: "Select a membership tier." };

  const repo = getRepository();
  const pending = (await repo.getUserMembershipApplications(session.id)).find(
    (a) => a.status === "pending",
  );
  if (pending) return { success: false, error: "You already have a pending application." };

  await repo.createMembershipApplication({
    id: uuidv4(),
    user_id: session.id,
    requested_tier: tier,
    status: "pending",
    note: null,
  });

  await repo.updateUser(session.id, { membership_status: "pending" });

  after(async () => {
    await notifyMembershipApplication(session.display_name, tier);
  });

  revalidatePath("/dashboard/membership");
  return { success: true };
}

export async function enterGiveawayAction(giveawayId: string): Promise<ActionResult> {
  const session = await requireAuth();
  if (!canEnterGiveaways(session)) {
    return { success: false, error: "Silver membership required to enter giveaways." };
  }

  const repo = getRepository();
  const giveaway = await repo.getGiveawayById(giveawayId);
  if (!giveaway || giveaway.status !== "active") {
    return { success: false, error: "This giveaway is not available." };
  }

  if (await repo.hasGiveawayEntry(giveawayId, session.id)) {
    return { success: false, error: "You already entered this giveaway." };
  }

  await repo.createGiveawayEntry({
    id: uuidv4(),
    giveaway_id: giveawayId,
    user_id: session.id,
  });

  revalidatePath("/giveaways");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function registerMeetGreetAction(eventId: string): Promise<ActionResult> {
  const session = await requireAuth();
  if (!canRegisterMeetAndGreet(session)) {
    return { success: false, error: "Gold membership required for meet & greet registration." };
  }

  const repo = getRepository();
  const event = await repo.getMeetGreetById(eventId);
  if (!event || event.status !== "upcoming") {
    return { success: false, error: "This event is not available." };
  }

  if (await repo.hasMeetGreetRegistration(eventId, session.id)) {
    return { success: false, error: "You are already registered." };
  }

  const registrations = await repo.getMeetGreetRegistrations(eventId);
  const confirmed = registrations.filter((r) => !r.is_waitlist);
  const isWaitlist = confirmed.length >= event.max_spots;

  await repo.createMeetGreetRegistration({
    id: uuidv4(),
    event_id: eventId,
    user_id: session.id,
    is_waitlist: isWaitlist,
  });

  revalidatePath("/meet-and-greet");
  revalidatePath("/dashboard");
  return { success: true, error: isWaitlist ? "Added to waitlist — event is full." : undefined };
}

export async function purchaseTicketAction(
  ticketId: string,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireAuth();
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { success: false, error: "Quantity must be between 1 and 10." };
  }

  const repo = getRepository();
  const ticket = await repo.getTicketById(ticketId);
  if (!ticket || ticket.status !== "active") {
    return { success: false, error: "This ticket listing is not available." };
  }

  if (ticket.quantity_available < quantity) {
    return { success: false, error: "Not enough tickets available." };
  }

  const totalCents = ticket.price_cents * quantity;
  await repo.createTicketOrder({
    id: uuidv4(),
    ticket_id: ticketId,
    user_id: session.id,
    quantity,
    total_cents: totalCents,
    status: "pending",
  });

  const remaining = ticket.quantity_available - quantity;
  await repo.updateTicket(ticketId, {
    quantity_available: remaining,
    status: remaining === 0 ? "sold_out" : ticket.status,
  });

  after(async () => {
    await notifyTicketPurchase(
      session.id,
      session.display_name,
      ticket.title,
      quantity,
      totalCents,
    );
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/dashboard/tickets");
  return {
    success: true,
    error: "Order placed! The fan team will confirm your purchase and send payment details.",
  };
}

export async function createThreadAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject || !body) return { success: false, error: "Subject and message are required." };

  const repo = getRepository();
  const threadId = uuidv4();
  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: session.id,
    subject,
    body,
    sender_role: "fan",
    is_read: false,
    status: "open",
  });

  after(async () => {
    await notifyAdminsNewMessage(session.display_name);
  });

  revalidatePath("/dashboard/messages");
  return { success: true };
}

export async function replyThreadAction(threadId: string, formData: FormData): Promise<ActionResult> {
  const session = await requireAuth();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { success: false, error: "Message cannot be empty." };

  const repo = getRepository();
  const messages = await repo.getMessagesByThread(threadId);
  if (messages.length === 0 || messages[0].user_id !== session.id) {
    return { success: false, error: "Thread not found." };
  }

  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: session.id,
    subject: messages[0].subject,
    body,
    sender_role: "fan",
    is_read: false,
    status: "open",
  });

  after(async () => {
    await notifyAdminsNewMessage(session.display_name);
  });

  revalidatePath(`/dashboard/messages/${threadId}`);
  return { success: true };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!displayName) return { success: false, error: "Display name is required." };

  const repo = getRepository();
  await repo.updateUser(session.id, { display_name: displayName, country });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth();
  const file = formData.get("avatar") as File | null;
  if (!file) return { success: false, error: "No file selected." };

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Avatar must be under 2MB." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, and WebP are allowed." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const repo = getRepository();
  await repo.updateUser(session.id, { avatar_url: base64 });

  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await requireAuth();
  const repo = getRepository();
  await repo.markAllNotificationsRead(session.id);
  revalidatePath("/dashboard/notifications");
}
