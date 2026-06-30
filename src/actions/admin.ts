"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import {
  notifyFanNewMessage,
  notifyMembershipDecision,
  notifyNewGiveaway,
  notifyNewEvent,
  notifyNewTickets,
  notifyUser,
  broadcastToFans,
} from "@/lib/notify";
import type {
  ContactPlatform,
  ContactRecipient,
  GiveawayStatus,
  MeetGreetStatus,
  MembershipTier,
  TicketStatus,
  UserRole,
} from "@/lib/types";
import { readImagesFromFormData, toImageFields } from "@/lib/images";

export type ActionResult = { success: boolean; error?: string };

export async function saveSiteSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  await repo.updateSiteSettings({
    celebrity_name: String(formData.get("celebrity_name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    hero_video_url: String(formData.get("hero_video_url") ?? ""),
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function saveGiveawayAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const notify = formData.get("notify") === "on";
  const images = await readImagesFromFormData(formData);
  if (images.error) return { success: false, error: images.error };

  const data = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    ...toImageFields(images.data),
    status: String(formData.get("status") ?? "draft") as GiveawayStatus,
    ends_at: String(formData.get("ends_at") ?? "") || null,
  };

  if (id) {
    const prev = await repo.getGiveawayById(id);
    await repo.updateGiveaway(id, data);
    if (notify && prev?.status !== "active" && data.status === "active") {
      await notifyNewGiveaway(data.title);
    }
  } else {
    const created = await repo.createGiveaway({ id: uuidv4(), ...data });
    if (notify && data.status === "active") {
      await notifyNewGiveaway(created.title);
    }
  }

  revalidatePath("/admin/giveaways");
  revalidatePath("/giveaways");
  return { success: true };
}

export async function deleteGiveawayAction(id: string): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  await repo.deleteGiveaway(id);
  revalidatePath("/admin/giveaways");
}

export async function saveMeetGreetAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const notify = formData.get("notify") === "on";
  const images = await readImagesFromFormData(formData);
  if (images.error) return { success: false, error: images.error };

  const data = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    location: String(formData.get("location") ?? ""),
    event_date: String(formData.get("event_date") ?? ""),
    max_spots: Number(formData.get("max_spots") ?? 10),
    status: String(formData.get("status") ?? "upcoming") as MeetGreetStatus,
    ...toImageFields(images.data),
  };

  if (id) {
    const prev = await repo.getMeetGreetById(id);
    await repo.updateMeetGreet(id, data);
    if (notify && prev?.status !== "upcoming" && data.status === "upcoming") {
      await notifyNewEvent(data.title);
    }
  } else {
    const created = await repo.createMeetGreet({ id: uuidv4(), ...data });
    if (notify && data.status === "upcoming") {
      await notifyNewEvent(created.title);
    }
  }

  revalidatePath("/admin/meet-greet");
  revalidatePath("/meet-and-greet");
  return { success: true };
}

export async function deleteMeetGreetAction(id: string): Promise<void> {
  await requireAdmin();
  await getRepository().deleteMeetGreet(id);
  revalidatePath("/admin/meet-greet");
}

export async function saveTicketAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const notify = formData.get("notify") === "on";
  const data = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    venue: String(formData.get("venue") ?? ""),
    city: String(formData.get("city") ?? ""),
    event_date: String(formData.get("event_date") ?? ""),
    price_cents: Math.round(Number(formData.get("price") ?? 0) * 100),
    quantity_available: Number(formData.get("quantity_available") ?? 0),
    image_url: String(formData.get("image_url") ?? "") || null,
    status: String(formData.get("status") ?? "draft") as TicketStatus,
    external_id: null,
    source_name: null,
    source_url: null,
    fetched_at: null,
  };

  if (id) {
    const prev = await repo.getTicketById(id);
    await repo.updateTicket(id, data);
    if (notify && prev?.status !== "active" && data.status === "active") {
      await notifyNewTickets(data.title);
    }
  } else {
    const created = await repo.createTicket({ id: uuidv4(), ...data });
    if (notify && data.status === "active") {
      await notifyNewTickets(created.title);
    }
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/tickets");
}

export async function fetchShowsNowAction(): Promise<void> {
  await requireAdmin();
  if (!process.env.TICKETMASTER_API_KEY) return;
  try {
    const { syncMorganWallenShows } = await import("@/lib/sync-shows");
    await syncMorganWallenShows();
    revalidatePath("/admin/tickets");
  } catch {
    // Silently fail until Ticketmaster is configured
  }
}

export async function approveTicketListingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const notify = formData.get("notify") === "on";
  const priceCents = Math.round(Number(formData.get("price") ?? 0) * 100);
  const quantity = Number(formData.get("quantity_available") ?? 0);

  const ticket = await repo.getTicketById(id);
  if (!ticket || ticket.status !== "pending_review") return;
  if (priceCents <= 0) return;
  if (quantity <= 0) return;

  await repo.updateTicket(id, {
    price_cents: priceCents,
    quantity_available: quantity,
    status: "active",
  });

  if (notify) {
    await notifyNewTickets(ticket.title);
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/tickets");
}

export async function rejectTicketListingAction(id: string): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const ticket = await repo.getTicketById(id);
  if (!ticket || ticket.status !== "pending_review") return;
  await repo.updateTicket(id, { status: "rejected" });
  revalidatePath("/admin/tickets");
}

export async function deleteTicketAction(id: string): Promise<void> {
  await requireAdmin();
  await getRepository().deleteTicket(id);
  revalidatePath("/admin/tickets");
  revalidatePath("/tickets");
}

export async function updateTicketOrderStatusAction(
  orderId: string,
  status: "confirmed" | "cancelled",
): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const order = await repo.getTicketOrderById(orderId);
  if (!order || order.status !== "pending") return;

  const ticket = await repo.getTicketById(order.ticket_id);
  if (!ticket) return;

  await repo.updateTicketOrder(orderId, { status });

  if (status === "cancelled") {
    const restored = ticket.quantity_available + order.quantity;
    await repo.updateTicket(ticket.id, {
      quantity_available: restored,
      status: ticket.status === "sold_out" ? "active" : ticket.status,
    });
    const user = await repo.getUserById(order.user_id);
    if (user) {
      await notifyUser(
        order.user_id,
        "Ticket order cancelled",
        `Your order for ${ticket.title} was cancelled. Tickets have been released.`,
        `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard/tickets`,
      );
    }
  } else {
    const user = await repo.getUserById(order.user_id);
    if (user) {
      await notifyUser(
        order.user_id,
        "Ticket order confirmed!",
        `Your purchase for ${ticket.title} (${order.quantity} ticket${order.quantity > 1 ? "s" : ""}) is confirmed.`,
        `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard/tickets`,
      );
    }
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/tickets");
}

export async function saveCommunityAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    platform: String(formData.get("platform") ?? ""),
    url: String(formData.get("url") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (id) await repo.updateCommunity(id, data);
  else await repo.createCommunity({ id: uuidv4(), ...data });
  revalidatePath("/admin/communities");
  revalidatePath("/communities");
}

export async function deleteCommunityAction(id: string): Promise<void> {
  await requireAdmin();
  await getRepository().deleteCommunity(id);
  revalidatePath("/admin/communities");
}

export async function saveContactLinkAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const data = {
    recipient: String(formData.get("recipient") ?? "team") as ContactRecipient,
    platform: String(formData.get("platform") ?? "whatsapp") as ContactPlatform,
    url: String(formData.get("url") ?? ""),
    label: String(formData.get("label") ?? ""),
  };
  if (id) await repo.updateContactLink(id, data);
  else await repo.createContactLink({ id: uuidv4(), ...data });
  revalidatePath("/admin/contact-links");
  revalidatePath("/contact");
}

export async function deleteContactLinkAction(id: string): Promise<void> {
  await requireAdmin();
  await getRepository().deleteContactLink(id);
  revalidatePath("/admin/contact-links");
}

export async function saveSiteButtonAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const id = String(formData.get("id") ?? "");
  const data = {
    label: String(formData.get("label") ?? ""),
    url: String(formData.get("url") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (id) await repo.updateSiteButton(id, data);
  else await repo.createSiteButton({ id: uuidv4(), ...data });
  revalidatePath("/admin/buttons");
  revalidatePath("/");
}

export async function deleteSiteButtonAction(id: string): Promise<void> {
  await requireAdmin();
  await getRepository().deleteSiteButton(id);
  revalidatePath("/admin/buttons");
}

export async function reviewMembershipAction(
  applicationId: string,
  approved: boolean,
): Promise<void> {
  await requireAdmin();
  const repo = getRepository();
  const app = (await repo.getMembershipApplications()).find((a) => a.id === applicationId);
  if (!app) return;

  await repo.updateMembershipApplication(applicationId, {
    status: approved ? "approved" : "rejected",
    reviewed_at: new Date().toISOString(),
  });

  const user = await repo.getUserById(app.user_id);
  if (!user) return;

  if (approved) {
    await repo.updateUser(app.user_id, {
      membership_tier: app.requested_tier,
      membership_status: "approved",
    });
  } else {
    await repo.updateUser(app.user_id, { membership_status: "rejected" });
  }

  await notifyMembershipDecision(
    app.user_id,
    user.email,
    user.display_name,
    approved,
    app.requested_tier,
  );

  revalidatePath("/admin/memberships");
  revalidatePath("/dashboard/membership");
}

export async function setMembershipBadgeAction(
  userId: string,
  tier: MembershipTier,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const repo = getRepository();
  const user = await repo.getUserById(userId);
  if (!user) return { success: false, error: "User not found." };

  await repo.updateUser(userId, {
    membership_tier: tier,
    membership_status: tier === "none" ? "none" : "approved",
  });

  if (user.email !== admin.email) {
    const { sendMembershipUpgradeEmail } = await import("@/lib/email");
    await sendMembershipUpgradeEmail(user.email, user.display_name, tier);
  }

  revalidatePath("/admin/team");
  return { success: true };
}

export async function changeUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { success: false, error: "You cannot change your own role." };
  }

  const repo = getRepository();
  const user = await repo.getUserById(userId);
  if (!user) return { success: false, error: "User not found." };

  if (user.role === "admin" && role === "fan") {
    const admins = await repo.getAllAdmins();
    if (admins.length <= 1) {
      return { success: false, error: "Cannot demote the last admin." };
    }
    await repo.updateUser(userId, {
      role: "fan",
      membership_tier: "none",
      membership_status: "none",
    });
  } else {
    await repo.updateUser(userId, { role });
  }

  revalidatePath("/admin/team");
  return { success: true };
}

export async function deleteFanAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { success: false, error: "You cannot delete your own account." };
  }

  const repo = getRepository();
  const user = await repo.getUserById(userId);
  if (!user) return { success: false, error: "User not found." };

  if (user.role === "admin") {
    const admins = await repo.getAllAdmins();
    if (admins.length <= 1) {
      return { success: false, error: "Cannot delete the last admin." };
    }
  }

  await repo.deleteUser(userId);
  revalidatePath("/admin/team");
  return { success: true };
}

export async function adminReplyAction(threadId: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const body = String(formData.get("body") ?? "").trim();
  const images = await readImagesFromFormData(formData);
  if (images.error) return { success: false, error: images.error };
  if (!body && images.data.length === 0) return { success: false, error: "Message or image is required." };

  const repo = getRepository();
  const messages = await repo.getMessagesByThread(threadId);
  if (messages.length === 0) return { success: false, error: "Thread not found." };

  const fanId = messages[0].user_id;
  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: fanId,
    subject: messages[0].subject,
    body: body || " ",
    ...toImageFields(images.data),
    sender_role: "admin",
    is_read: false,
    status: "open",
  });

  const fan = await repo.getUserById(fanId);
  if (fan) {
    await notifyFanNewMessage(fanId, fan.email, fan.display_name, threadId);
  }

  revalidatePath(`/admin/messages/${threadId}`);
  return { success: true };
}

export async function adminComposeAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const fanId = String(formData.get("fan_id") ?? "");
  const broadcast = formData.get("broadcast") === "on";
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const sendNotification = formData.get("notify") === "on";
  const images = await readImagesFromFormData(formData);
  if (images.error) return { success: false, error: images.error };
  if (!subject) return { success: false, error: "Subject is required." };
  if (!body && images.data.length === 0) return { success: false, error: "Message or image is required." };

  const repo = getRepository();
  let newThreadId: string | undefined;

  if (broadcast) {
    const fans = await repo.getAllFans();
    await broadcastToFans(
      fans.map((f) => f.id),
      subject,
      body,
      sendNotification,
    );
  } else {
    if (!fanId) return { success: false, error: "Select a fan or enable broadcast." };
    newThreadId = uuidv4();
    await repo.createMessage({
      id: uuidv4(),
      thread_id: newThreadId,
      user_id: fanId,
      subject,
      body: body || " ",
      ...toImageFields(images.data),
      sender_role: "admin",
      is_read: false,
      status: "open",
    });
    const fan = await repo.getUserById(fanId);
    if (fan) await notifyFanNewMessage(fanId, fan.email, fan.display_name, newThreadId);
  }

  revalidatePath("/admin/messages");
  if (newThreadId) revalidatePath(`/admin/messages/${newThreadId}`);
  return { success: true };
}

export async function markThreadReadAdminAction(threadId: string) {
  await requireAdmin();
  await getRepository().markThreadRead(threadId, "admin");
  revalidatePath("/admin/messages");
}
