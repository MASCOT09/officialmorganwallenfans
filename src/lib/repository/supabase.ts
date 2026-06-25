import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import type {
  AdminUserSummary,
  AppUser,
  AppUserPublic,
  Community,
  CommunityStats,
  ContactLink,
  FanStats,
  Giveaway,
  GiveawayEntry,
  MeetGreet,
  MeetGreetRegistration,
  MembershipApplication,
  Message,
  MessageThread,
  Notification,
  PushSubscription,
  SiteButton,
  SiteSettings,
  Ticket,
  TicketOrder,
} from "../types";
import type { Repository } from "./types";

const PUBLIC_USER_COLUMNS =
  "id, email, display_name, role, country, avatar_url, membership_tier, membership_status, created_at, last_seen_at";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }
  return { url, key };
}

function omitKeys<T extends object>(obj: Partial<T>, ...keys: (keyof T)[]): Partial<T> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}

function throwIfError<T>(label: string, result: { data: T; error: { message: string } | null }): T {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

function toMessageThread(
  threadId: string,
  messages: Message[],
  extras?: { fan_display_name?: string; fan_last_seen_at?: string | null },
): MessageThread {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const latest = sorted[sorted.length - 1];
  const subject = sorted.find((m) => m.subject)?.subject ?? latest.subject;
  const userId = latest.user_id;

  return {
    thread_id: threadId,
    user_id: userId,
    subject,
    last_message: latest.body,
    last_message_at: latest.created_at,
    unread_count: 0,
    status: latest.status,
    ...extras,
  };
}

class SupabaseRepository implements Repository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  async getUserById(id: string): Promise<AppUser | null> {
    const result = await this.client.from("app_users").select("*").eq("id", id).maybeSingle();
    if (result.error) throw new Error(`getUserById: ${result.error.message}`);
    return result.data as AppUser | null;
  }

  async getUserByEmail(email: string): Promise<AppUser | null> {
    const result = await this.client
      .from("app_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (result.error) throw new Error(`getUserByEmail: ${result.error.message}`);
    return result.data as AppUser | null;
  }

  async createUser(data: Omit<AppUser, "created_at" | "last_seen_at">): Promise<AppUser> {
    const row = {
      ...data,
      id: data.id || uuidv4(),
      email: data.email.toLowerCase(),
      last_seen_at: null,
    };
    const result = await this.client.from("app_users").insert(row).select().single();
    return throwIfError("createUser", result) as AppUser;
  }

  async updateUser(id: string, data: Partial<AppUser>): Promise<AppUser> {
    const updates = omitKeys(data, "created_at", "last_seen_at");
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }
    const result = await this.client.from("app_users").update(updates).eq("id", id).select().single();
    return throwIfError("updateUser", result) as AppUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.client.from("app_users").delete().eq("id", id);
    if (result.error) throw new Error(`deleteUser: ${result.error.message}`);
  }

  async getAllFans(): Promise<AppUserPublic[]> {
    const result = await this.client
      .from("app_users")
      .select(PUBLIC_USER_COLUMNS)
      .eq("role", "fan")
      .order("created_at", { ascending: false });
    return throwIfError("getAllFans", result) as AppUserPublic[];
  }

  async getAllAdmins(): Promise<AppUserPublic[]> {
    const result = await this.client
      .from("app_users")
      .select(PUBLIC_USER_COLUMNS)
      .eq("role", "admin")
      .order("created_at", { ascending: false });
    return throwIfError("getAllAdmins", result) as AppUserPublic[];
  }

  async getFansForMessaging(): Promise<AdminUserSummary[]> {
    const fansResult = await this.client
      .from("app_users")
      .select(PUBLIC_USER_COLUMNS)
      .eq("role", "fan")
      .order("display_name", { ascending: true });
    const fans = throwIfError("getFansForMessaging", fansResult) as AppUserPublic[];

    const unreadResult = await this.client
      .from("messages")
      .select("user_id")
      .eq("sender_role", "fan")
      .eq("is_read", false);
    const unreadRows = throwIfError("getFansForMessaging unread", unreadResult) as { user_id: string }[];

    const unreadByUser = new Map<string, number>();
    for (const row of unreadRows) {
      unreadByUser.set(row.user_id, (unreadByUser.get(row.user_id) ?? 0) + 1);
    }

    return fans.map((fan) => ({
      ...fan,
      unread_fan_messages: unreadByUser.get(fan.id) ?? 0,
    }));
  }

  async getCommunityStats(): Promise<CommunityStats> {
    const result = await this.client
      .from("app_users")
      .select("membership_tier, country")
      .eq("role", "fan");
    const fans = throwIfError("getCommunityStats", result) as {
      membership_tier: AppUser["membership_tier"];
      country: string;
    }[];

    const countryCounts = new Map<string, number>();
    let tier_none = 0;
    let tier_silver = 0;
    let tier_gold = 0;
    let tier_platinum = 0;

    for (const fan of fans) {
      switch (fan.membership_tier) {
        case "silver":
          tier_silver++;
          break;
        case "gold":
          tier_gold++;
          break;
        case "platinum":
          tier_platinum++;
          break;
        default:
          tier_none++;
      }
      const country = fan.country || "Unknown";
      countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
    }

    const by_country = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));

    return {
      total_fans: fans.length,
      tier_none,
      tier_silver,
      tier_gold,
      tier_platinum,
      by_country,
    };
  }

  async updateLastSeen(id: string, at: string): Promise<void> {
    const result = await this.client.from("app_users").update({ last_seen_at: at }).eq("id", id);
    if (result.error) throw new Error(`updateLastSeen: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Site settings
  // ---------------------------------------------------------------------------

  async getSiteSettings(): Promise<SiteSettings> {
    const result = await this.client.from("site_settings").select("*").limit(1).maybeSingle();
    if (result.error) throw new Error(`getSiteSettings: ${result.error.message}`);
    if (result.data) {
      const settings = result.data as SiteSettings;
      if (settings.celebrity_name === "Keanu Reeves") {
        return this.updateSiteSettings({
          celebrity_name: "Morgan Wallen",
          tagline:
            settings.tagline ||
            "Official fan experience — giveaways, meet & greets, and more.",
        });
      }
      return settings;
    }

    const id = uuidv4();
    const insert = await this.client
      .from("site_settings")
      .insert({
        id,
        celebrity_name: "Morgan Wallen",
        tagline: "Official fan experience — giveaways, meet & greets, and more.",
        hero_video_url: "",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    return throwIfError("getSiteSettings insert", insert) as SiteSettings;
  }

  async updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const updates = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    const result = await this.client
      .from("site_settings")
      .update(updates)
      .eq("id", current.id)
      .select()
      .single();
    return throwIfError("updateSiteSettings", result) as SiteSettings;
  }

  // ---------------------------------------------------------------------------
  // Giveaways
  // ---------------------------------------------------------------------------

  async getGiveaways(status?: string): Promise<Giveaway[]> {
    let query = this.client.from("giveaways").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const result = await query;
    return throwIfError("getGiveaways", result) as Giveaway[];
  }

  async getGiveawayById(id: string): Promise<Giveaway | null> {
    const result = await this.client.from("giveaways").select("*").eq("id", id).maybeSingle();
    if (result.error) throw new Error(`getGiveawayById: ${result.error.message}`);
    return result.data as Giveaway | null;
  }

  async createGiveaway(data: Omit<Giveaway, "created_at">): Promise<Giveaway> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("giveaways").insert(row).select().single();
    return throwIfError("createGiveaway", result) as Giveaway;
  }

  async updateGiveaway(id: string, data: Partial<Giveaway>): Promise<Giveaway> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("giveaways").update(updates).eq("id", id).select().single();
    return throwIfError("updateGiveaway", result) as Giveaway;
  }

  async deleteGiveaway(id: string): Promise<void> {
    const result = await this.client.from("giveaways").delete().eq("id", id);
    if (result.error) throw new Error(`deleteGiveaway: ${result.error.message}`);
  }

  async getGiveawayEntries(giveawayId: string): Promise<GiveawayEntry[]> {
    const result = await this.client
      .from("giveaway_entries")
      .select("*")
      .eq("giveaway_id", giveawayId)
      .order("created_at", { ascending: false });
    return throwIfError("getGiveawayEntries", result) as GiveawayEntry[];
  }

  async getUserGiveawayEntries(userId: string): Promise<GiveawayEntry[]> {
    const result = await this.client
      .from("giveaway_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return throwIfError("getUserGiveawayEntries", result) as GiveawayEntry[];
  }

  async createGiveawayEntry(data: Omit<GiveawayEntry, "created_at">): Promise<GiveawayEntry> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("giveaway_entries").insert(row).select().single();
    return throwIfError("createGiveawayEntry", result) as GiveawayEntry;
  }

  async hasGiveawayEntry(giveawayId: string, userId: string): Promise<boolean> {
    const result = await this.client
      .from("giveaway_entries")
      .select("id")
      .eq("giveaway_id", giveawayId)
      .eq("user_id", userId)
      .maybeSingle();
    if (result.error) throw new Error(`hasGiveawayEntry: ${result.error.message}`);
    return result.data !== null;
  }

  async deleteGiveawayEntriesByUser(userId: string): Promise<void> {
    const result = await this.client.from("giveaway_entries").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deleteGiveawayEntriesByUser: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Meet & Greet
  // ---------------------------------------------------------------------------

  async getMeetGreets(status?: string): Promise<MeetGreet[]> {
    let query = this.client.from("meet_greet").select("*").order("event_date", { ascending: true });
    if (status) query = query.eq("status", status);
    const result = await query;
    return throwIfError("getMeetGreets", result) as MeetGreet[];
  }

  async getMeetGreetById(id: string): Promise<MeetGreet | null> {
    const result = await this.client.from("meet_greet").select("*").eq("id", id).maybeSingle();
    if (result.error) throw new Error(`getMeetGreetById: ${result.error.message}`);
    return result.data as MeetGreet | null;
  }

  async createMeetGreet(data: Omit<MeetGreet, "created_at">): Promise<MeetGreet> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("meet_greet").insert(row).select().single();
    return throwIfError("createMeetGreet", result) as MeetGreet;
  }

  async updateMeetGreet(id: string, data: Partial<MeetGreet>): Promise<MeetGreet> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("meet_greet").update(updates).eq("id", id).select().single();
    return throwIfError("updateMeetGreet", result) as MeetGreet;
  }

  async deleteMeetGreet(id: string): Promise<void> {
    const result = await this.client.from("meet_greet").delete().eq("id", id);
    if (result.error) throw new Error(`deleteMeetGreet: ${result.error.message}`);
  }

  async getMeetGreetRegistrations(eventId: string): Promise<MeetGreetRegistration[]> {
    const result = await this.client
      .from("meet_greet_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    return throwIfError("getMeetGreetRegistrations", result) as MeetGreetRegistration[];
  }

  async getUserMeetGreetRegistrations(userId: string): Promise<MeetGreetRegistration[]> {
    const result = await this.client
      .from("meet_greet_registrations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return throwIfError("getUserMeetGreetRegistrations", result) as MeetGreetRegistration[];
  }

  async createMeetGreetRegistration(
    data: Omit<MeetGreetRegistration, "created_at">,
  ): Promise<MeetGreetRegistration> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("meet_greet_registrations").insert(row).select().single();
    return throwIfError("createMeetGreetRegistration", result) as MeetGreetRegistration;
  }

  async hasMeetGreetRegistration(eventId: string, userId: string): Promise<boolean> {
    const result = await this.client
      .from("meet_greet_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();
    if (result.error) throw new Error(`hasMeetGreetRegistration: ${result.error.message}`);
    return result.data !== null;
  }

  async deleteMeetGreetRegistrationsByUser(userId: string): Promise<void> {
    const result = await this.client.from("meet_greet_registrations").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deleteMeetGreetRegistrationsByUser: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Tickets
  // ---------------------------------------------------------------------------

  async getTickets(status?: string): Promise<Ticket[]> {
    let query = this.client.from("tickets").select("*").order("event_date", { ascending: true });
    if (status) query = query.eq("status", status);
    const result = await query;
    return throwIfError("getTickets", result) as Ticket[];
  }

  async getTicketById(id: string): Promise<Ticket | null> {
    const result = await this.client.from("tickets").select("*").eq("id", id).maybeSingle();
    if (result.error) throw new Error(`getTicketById: ${result.error.message}`);
    return result.data as Ticket | null;
  }

  async getTicketByExternalId(externalId: string, sourceName: string): Promise<Ticket | null> {
    const result = await this.client
      .from("tickets")
      .select("*")
      .eq("external_id", externalId)
      .eq("source_name", sourceName)
      .maybeSingle();
    if (result.error) throw new Error(`getTicketByExternalId: ${result.error.message}`);
    return result.data as Ticket | null;
  }

  async createTicket(data: Omit<Ticket, "created_at">): Promise<Ticket> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("tickets").insert(row).select().single();
    return throwIfError("createTicket", result) as Ticket;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("tickets").update(updates).eq("id", id).select().single();
    return throwIfError("updateTicket", result) as Ticket;
  }

  async deleteTicket(id: string): Promise<void> {
    const result = await this.client.from("tickets").delete().eq("id", id);
    if (result.error) throw new Error(`deleteTicket: ${result.error.message}`);
  }

  async getTicketOrders(filters?: {
    ticketId?: string;
    userId?: string;
    status?: string;
  }): Promise<TicketOrder[]> {
    let query = this.client.from("ticket_orders").select("*").order("created_at", { ascending: false });
    if (filters?.ticketId) query = query.eq("ticket_id", filters.ticketId);
    if (filters?.userId) query = query.eq("user_id", filters.userId);
    if (filters?.status) query = query.eq("status", filters.status);
    const result = await query;
    return throwIfError("getTicketOrders", result) as TicketOrder[];
  }

  async getTicketOrderById(id: string): Promise<TicketOrder | null> {
    const result = await this.client.from("ticket_orders").select("*").eq("id", id).maybeSingle();
    if (result.error) throw new Error(`getTicketOrderById: ${result.error.message}`);
    return result.data as TicketOrder | null;
  }

  async createTicketOrder(data: Omit<TicketOrder, "created_at">): Promise<TicketOrder> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("ticket_orders").insert(row).select().single();
    return throwIfError("createTicketOrder", result) as TicketOrder;
  }

  async updateTicketOrder(id: string, data: Partial<TicketOrder>): Promise<TicketOrder> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("ticket_orders").update(updates).eq("id", id).select().single();
    return throwIfError("updateTicketOrder", result) as TicketOrder;
  }

  async deleteTicketOrdersByUser(userId: string): Promise<void> {
    const result = await this.client.from("ticket_orders").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deleteTicketOrdersByUser: ${result.error.message}`);
  }

  async countUserTicketOrders(userId: string): Promise<number> {
    const result = await this.client
      .from("ticket_orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (result.error) throw new Error(`countUserTicketOrders: ${result.error.message}`);
    return result.count ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Communities
  // ---------------------------------------------------------------------------

  async getCommunities(): Promise<Community[]> {
    const result = await this.client.from("communities").select("*").order("sort_order", { ascending: true });
    return throwIfError("getCommunities", result) as Community[];
  }

  async createCommunity(data: Omit<Community, "created_at">): Promise<Community> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("communities").insert(row).select().single();
    return throwIfError("createCommunity", result) as Community;
  }

  async updateCommunity(id: string, data: Partial<Community>): Promise<Community> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("communities").update(updates).eq("id", id).select().single();
    return throwIfError("updateCommunity", result) as Community;
  }

  async deleteCommunity(id: string): Promise<void> {
    const result = await this.client.from("communities").delete().eq("id", id);
    if (result.error) throw new Error(`deleteCommunity: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Contact links
  // ---------------------------------------------------------------------------

  async getContactLinks(): Promise<ContactLink[]> {
    const result = await this.client.from("contact_links").select("*").order("created_at", { ascending: true });
    return throwIfError("getContactLinks", result) as ContactLink[];
  }

  async createContactLink(data: Omit<ContactLink, "created_at">): Promise<ContactLink> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("contact_links").insert(row).select().single();
    return throwIfError("createContactLink", result) as ContactLink;
  }

  async updateContactLink(id: string, data: Partial<ContactLink>): Promise<ContactLink> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("contact_links").update(updates).eq("id", id).select().single();
    return throwIfError("updateContactLink", result) as ContactLink;
  }

  async deleteContactLink(id: string): Promise<void> {
    const result = await this.client.from("contact_links").delete().eq("id", id);
    if (result.error) throw new Error(`deleteContactLink: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Site buttons
  // ---------------------------------------------------------------------------

  async getSiteButtons(): Promise<SiteButton[]> {
    const result = await this.client.from("site_buttons").select("*").order("sort_order", { ascending: true });
    return throwIfError("getSiteButtons", result) as SiteButton[];
  }

  async createSiteButton(data: Omit<SiteButton, "created_at">): Promise<SiteButton> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("site_buttons").insert(row).select().single();
    return throwIfError("createSiteButton", result) as SiteButton;
  }

  async updateSiteButton(id: string, data: Partial<SiteButton>): Promise<SiteButton> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client.from("site_buttons").update(updates).eq("id", id).select().single();
    return throwIfError("updateSiteButton", result) as SiteButton;
  }

  async deleteSiteButton(id: string): Promise<void> {
    const result = await this.client.from("site_buttons").delete().eq("id", id);
    if (result.error) throw new Error(`deleteSiteButton: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------------------

  private groupMessagesByThread(messages: Message[]): Map<string, Message[]> {
    const map = new Map<string, Message[]>();
    for (const msg of messages) {
      const list = map.get(msg.thread_id) ?? [];
      list.push(msg);
      map.set(msg.thread_id, list);
    }
    return map;
  }

  private buildThreads(
    messages: Message[],
    unreadSenderRole: "fan" | "admin",
    userFilter?: string,
    fanInfo?: Map<string, { display_name: string; last_seen_at: string | null }>,
  ): MessageThread[] {
    const filtered = userFilter ? messages.filter((m) => m.user_id === userFilter) : messages;
    const grouped = this.groupMessagesByThread(filtered);
    const threads: MessageThread[] = [];

    for (const [threadId, threadMessages] of grouped) {
      const fan = fanInfo?.get(threadMessages[0].user_id);
      const thread = toMessageThread(threadId, threadMessages, {
        fan_display_name: fan?.display_name,
        fan_last_seen_at: fan?.last_seen_at,
      });
      thread.unread_count = threadMessages.filter(
        (m) => m.sender_role === unreadSenderRole && !m.is_read,
      ).length;
      threads.push(thread);
    }

    return threads.sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
    );
  }

  async getMessagesByThread(threadId: string): Promise<Message[]> {
    const result = await this.client
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    return throwIfError("getMessagesByThread", result) as Message[];
  }

  async getThreadsForUser(userId: string): Promise<MessageThread[]> {
    const result = await this.client
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const messages = throwIfError("getThreadsForUser", result) as Message[];
    return this.buildThreads(messages, "admin", userId);
  }

  async getAllThreads(): Promise<MessageThread[]> {
    const messagesResult = await this.client
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    const messages = throwIfError("getAllThreads", messagesResult) as Message[];

    const userIds = [...new Set(messages.map((m) => m.user_id))];
    const fanInfo = new Map<string, { display_name: string; last_seen_at: string | null }>();

    if (userIds.length > 0) {
      const fansResult = await this.client
        .from("app_users")
        .select("id, display_name, last_seen_at")
        .in("id", userIds);
      const fans = throwIfError("getAllThreads fans", fansResult) as {
        id: string;
        display_name: string;
        last_seen_at: string | null;
      }[];
      for (const fan of fans) {
        fanInfo.set(fan.id, {
          display_name: fan.display_name,
          last_seen_at: fan.last_seen_at,
        });
      }
    }

    return this.buildThreads(messages, "fan", undefined, fanInfo);
  }

  async createMessage(data: Omit<Message, "created_at">): Promise<Message> {
    const row = {
      ...data,
      id: data.id || uuidv4(),
      thread_id: data.thread_id || uuidv4(),
    };
    const result = await this.client.from("messages").insert(row).select().single();
    return throwIfError("createMessage", result) as Message;
  }

  async markThreadRead(threadId: string, forRole: "fan" | "admin"): Promise<void> {
    const senderRoleToMark = forRole === "fan" ? "admin" : "fan";
    const result = await this.client
      .from("messages")
      .update({ is_read: true })
      .eq("thread_id", threadId)
      .eq("sender_role", senderRoleToMark)
      .eq("is_read", false);
    if (result.error) throw new Error(`markThreadRead: ${result.error.message}`);
  }

  async deleteMessagesByUser(userId: string): Promise<void> {
    const result = await this.client.from("messages").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deleteMessagesByUser: ${result.error.message}`);
  }

  async countUserMessages(userId: string): Promise<number> {
    const result = await this.client
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (result.error) throw new Error(`countUserMessages: ${result.error.message}`);
    return result.count ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------

  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await this.client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return throwIfError("getNotifications", result) as Notification[];
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await this.client
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (result.error) throw new Error(`getUnreadNotificationCount: ${result.error.message}`);
    return result.count ?? 0;
  }

  async createNotification(data: Omit<Notification, "created_at">): Promise<Notification> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("notifications").insert(row).select().single();
    return throwIfError("createNotification", result) as Notification;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    const result = await this.client
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (result.error) throw new Error(`markAllNotificationsRead: ${result.error.message}`);
  }

  async deleteNotificationsByUser(userId: string): Promise<void> {
    const result = await this.client.from("notifications").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deleteNotificationsByUser: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Membership applications
  // ---------------------------------------------------------------------------

  async getMembershipApplications(status?: string): Promise<MembershipApplication[]> {
    let query = this.client
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const result = await query;
    return throwIfError("getMembershipApplications", result) as MembershipApplication[];
  }

  async getUserMembershipApplications(userId: string): Promise<MembershipApplication[]> {
    const result = await this.client
      .from("membership_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return throwIfError("getUserMembershipApplications", result) as MembershipApplication[];
  }

  async createMembershipApplication(
    data: Omit<MembershipApplication, "created_at" | "reviewed_at">,
  ): Promise<MembershipApplication> {
    const row = { ...data, id: data.id || uuidv4(), reviewed_at: null };
    const result = await this.client.from("membership_applications").insert(row).select().single();
    return throwIfError("createMembershipApplication", result) as MembershipApplication;
  }

  async updateMembershipApplication(
    id: string,
    data: Partial<MembershipApplication>,
  ): Promise<MembershipApplication> {
    const updates = omitKeys(data, "created_at");
    const result = await this.client
      .from("membership_applications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return throwIfError("updateMembershipApplication", result) as MembershipApplication;
  }

  async deleteMembershipApplicationsByUser(userId: string): Promise<void> {
    const result = await this.client.from("membership_applications").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deleteMembershipApplicationsByUser: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Push subscriptions
  // ---------------------------------------------------------------------------

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const result = await this.client
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return throwIfError("getPushSubscriptions", result) as PushSubscription[];
  }

  async getAllPushSubscriptionsForUsers(userIds: string[]): Promise<PushSubscription[]> {
    if (userIds.length === 0) return [];
    const result = await this.client.from("push_subscriptions").select("*").in("user_id", userIds);
    return throwIfError("getAllPushSubscriptionsForUsers", result) as PushSubscription[];
  }

  async getAdminPushSubscriptions(): Promise<PushSubscription[]> {
    const adminsResult = await this.client.from("app_users").select("id").eq("role", "admin");
    const admins = throwIfError("getAdminPushSubscriptions admins", adminsResult) as { id: string }[];
    const adminIds = admins.map((a) => a.id);
    return this.getAllPushSubscriptionsForUsers(adminIds);
  }

  async createPushSubscription(data: Omit<PushSubscription, "created_at">): Promise<PushSubscription> {
    const row = { ...data, id: data.id || uuidv4() };
    const result = await this.client.from("push_subscriptions").insert(row).select().single();
    return throwIfError("createPushSubscription", result) as PushSubscription;
  }

  async deletePushSubscription(id: string): Promise<void> {
    const result = await this.client.from("push_subscriptions").delete().eq("id", id);
    if (result.error) throw new Error(`deletePushSubscription: ${result.error.message}`);
  }

  async deletePushSubscriptionsByUser(userId: string): Promise<void> {
    const result = await this.client.from("push_subscriptions").delete().eq("user_id", userId);
    if (result.error) throw new Error(`deletePushSubscriptionsByUser: ${result.error.message}`);
  }

  async deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
    const result = await this.client.from("push_subscriptions").delete().eq("endpoint", endpoint);
    if (result.error) throw new Error(`deletePushSubscriptionByEndpoint: ${result.error.message}`);
  }

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  async getFanStats(userId: string): Promise<FanStats> {
    const [total_messages, giveaway_entries, meet_greet_requests, ticket_orders, unread_notifications] =
      await Promise.all([
        this.countUserMessages(userId),
        this.countGiveawayEntries(userId),
        this.countMeetGreetRegistrations(userId),
        this.countUserTicketOrders(userId),
        this.getUnreadNotificationCount(userId),
      ]);

    return {
      total_messages,
      giveaway_entries,
      meet_greet_requests,
      ticket_orders,
      unread_notifications,
    };
  }

  private async countGiveawayEntries(userId: string): Promise<number> {
    const result = await this.client
      .from("giveaway_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (result.error) throw new Error(`countGiveawayEntries: ${result.error.message}`);
    return result.count ?? 0;
  }

  private async countMeetGreetRegistrations(userId: string): Promise<number> {
    const result = await this.client
      .from("meet_greet_registrations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (result.error) throw new Error(`countMeetGreetRegistrations: ${result.error.message}`);
    return result.count ?? 0;
  }
}

export function createSupabaseRepository(): Repository {
  const { url, key } = getSupabaseConfig();
  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return new SupabaseRepository(client);
}
