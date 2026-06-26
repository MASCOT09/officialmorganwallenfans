import ExcelJS from "exceljs";
import path from "path";
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

const WORKBOOK_PATH = path.join(process.cwd(), "data", "celebrity-site.xlsx");

const SHEETS = [
  "app_users",
  "site_settings",
  "giveaways",
  "giveaway_entries",
  "meet_greet",
  "meet_greet_registrations",
  "communities",
  "contact_links",
  "site_buttons",
  "messages",
  "notifications",
  "membership_applications",
  "push_subscriptions",
  "tickets",
  "ticket_orders",
] as const;

type SheetName = (typeof SHEETS)[number];

const HEADERS: Record<SheetName, string[]> = {
  app_users: [
    "id", "email", "password_hash", "display_name", "role", "country",
    "avatar_url", "membership_tier", "membership_status", "created_at", "last_seen_at",
  ],
  site_settings: ["id", "celebrity_name", "tagline", "hero_video_url", "updated_at"],
  giveaways: ["id", "title", "description", "image_url", "status", "ends_at", "created_at"],
  giveaway_entries: ["id", "giveaway_id", "user_id", "created_at"],
  meet_greet: [
    "id", "title", "description", "location", "event_date", "max_spots", "status", "image_url", "created_at",
  ],
  meet_greet_registrations: ["id", "event_id", "user_id", "is_waitlist", "created_at"],
  communities: ["id", "name", "description", "platform", "url", "sort_order", "created_at"],
  contact_links: ["id", "recipient", "platform", "url", "label", "created_at"],
  site_buttons: ["id", "label", "url", "sort_order", "created_at"],
  messages: [
    "id", "thread_id", "user_id", "subject", "body", "image_url", "sender_role", "is_read", "status", "created_at",
  ],
  notifications: ["id", "user_id", "title", "body", "link", "is_read", "created_at"],
  membership_applications: [
    "id", "user_id", "requested_tier", "status", "note", "created_at", "reviewed_at",
  ],
  push_subscriptions: ["id", "user_id", "endpoint", "p256dh", "auth", "created_at"],
  tickets: [
    "id", "title", "description", "venue", "city", "event_date",
    "price_cents", "quantity_available", "image_url", "status", "created_at",
    "external_id", "source_name", "source_url", "fetched_at",
  ],
  ticket_orders: ["id", "ticket_id", "user_id", "quantity", "total_cents", "status", "created_at"],
};

function rowToObj<T>(headers: string[], row: ExcelJS.Row): T {
  const obj: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1).value;
    let val: unknown = cell;
    if (typeof cell === "object" && cell !== null && "text" in cell) {
      val = (cell as { text: string }).text;
    }
    if (val === "true" || val === true) val = true;
    if (val === "false" || val === false) val = false;
    if (val === "null" || val === "") val = null;
    obj[h] = val ?? null;
  });
  return obj as T;
}

function objToRow(headers: string[], obj: object): (string | number | boolean | null)[] {
  const record = obj as Record<string, unknown>;
  return headers.map((h) => {
    const v = record[h];
    if (v === null || v === undefined) return "";
    if (typeof v === "boolean") return v ? "true" : "false";
    return String(v);
  });
}

class ExcelRepository implements Repository {
  private workbook: ExcelJS.Workbook | null = null;

  private async load(): Promise<ExcelJS.Workbook> {
    if (this.workbook) return this.workbook;
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.readFile(WORKBOOK_PATH);
    } catch {
      for (const sheet of SHEETS) {
        const ws = wb.addWorksheet(sheet);
        ws.addRow(HEADERS[sheet]);
      }
      await wb.xlsx.writeFile(WORKBOOK_PATH);
    }
    for (const sheet of SHEETS) {
      if (!wb.getWorksheet(sheet)) {
        const ws = wb.addWorksheet(sheet);
        ws.addRow(HEADERS[sheet]);
      }
    }
    this.workbook = wb;
    return wb;
  }

  private async save(wb: ExcelJS.Workbook) {
    await wb.xlsx.writeFile(WORKBOOK_PATH);
  }

  private async getRows<T>(sheet: SheetName): Promise<T[]> {
    const wb = await this.load();
    const ws = wb.getWorksheet(sheet)!;
    const headers = HEADERS[sheet];
    const rows: T[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const id = row.getCell(1).value;
      if (!id) return;
      rows.push(rowToObj<T>(headers, row));
    });
    return rows;
  }

  private async setRows(sheet: SheetName, rows: object[]) {
    const wb = await this.load();
    const ws = wb.getWorksheet(sheet)!;
    const headers = HEADERS[sheet];
    while (ws.rowCount > 1) ws.spliceRows(2, 1);
    for (const row of rows) {
      ws.addRow(objToRow(headers, row));
    }
    await this.save(wb);
    this.workbook = wb;
  }

  private toPublicUser(u: AppUser): AppUserPublic {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...rest } = u;
    return rest;
  }

  private buildThreads(
    messages: Message[],
    userId?: string,
    forAdmin = false,
    users?: AppUser[],
  ): MessageThread[] {
    const grouped = new Map<string, Message[]>();
    for (const m of messages) {
      if (userId && m.user_id !== userId && !forAdmin) continue;
      const list = grouped.get(m.thread_id) ?? [];
      list.push(m);
      grouped.set(m.thread_id, list);
    }
    const threads: MessageThread[] = [];
    for (const [threadId, msgs] of grouped) {
      const sorted = msgs.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      const latest = sorted[sorted.length - 1];
      const unread = forAdmin
        ? sorted.filter((m) => m.sender_role === "fan" && !m.is_read).length
        : sorted.filter((m) => m.sender_role === "admin" && !m.is_read).length;
      const fan = users?.find((u) => u.id === latest.user_id);
      threads.push({
        thread_id: threadId,
        user_id: latest.user_id,
        subject: sorted.find((m) => m.subject)?.subject ?? latest.subject,
        last_message: latest.body,
        last_message_at: latest.created_at,
        unread_count: unread,
        status: latest.status,
        fan_display_name: fan?.display_name,
        fan_last_seen_at: fan?.last_seen_at,
      });
    }
    return threads.sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
    );
  }

  async getUserById(id: string) {
    const users = await this.getRows<AppUser>("app_users");
    return users.find((u) => u.id === id) ?? null;
  }

  async getUserByEmail(email: string) {
    const users = await this.getRows<AppUser>("app_users");
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async createUser(data: Omit<AppUser, "created_at" | "last_seen_at">) {
    const users = await this.getRows<AppUser>("app_users");
    const user: AppUser = {
      ...data,
      created_at: new Date().toISOString(),
      last_seen_at: null,
    };
    users.push(user);
    await this.setRows("app_users", users);
    return user;
  }

  async updateUser(id: string, data: Partial<AppUser>) {
    const users = await this.getRows<AppUser>("app_users");
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("User not found");
    users[idx] = { ...users[idx], ...data };
    await this.setRows("app_users", users);
    return users[idx];
  }

  async deleteUser(id: string) {
    const users = (await this.getRows<AppUser>("app_users")).filter((u) => u.id !== id);
    await this.setRows("app_users", users);
    const filterByUser = async (sheet: SheetName, field: string) => {
      const rows = await this.getRows<Record<string, unknown>>(sheet);
      await this.setRows(sheet, rows.filter((r) => r[field] !== id));
    };
    await filterByUser("giveaway_entries", "user_id");
    await filterByUser("meet_greet_registrations", "user_id");
    await filterByUser("messages", "user_id");
    await filterByUser("notifications", "user_id");
    await filterByUser("membership_applications", "user_id");
    await filterByUser("push_subscriptions", "user_id");
    await filterByUser("ticket_orders", "user_id");
  }

  async getAllFans() {
    return (await this.getRows<AppUser>("app_users"))
      .filter((u) => u.role === "fan")
      .map((u) => this.toPublicUser(u));
  }

  async getAllAdmins() {
    return (await this.getRows<AppUser>("app_users"))
      .filter((u) => u.role === "admin")
      .map((u) => this.toPublicUser(u));
  }

  async getFansForMessaging(): Promise<AdminUserSummary[]> {
    const fans = await this.getAllFans();
    const messages = await this.getRows<Message>("messages");
    return fans.map((fan) => ({
      ...fan,
      unread_fan_messages: messages.filter(
        (m) => m.user_id === fan.id && m.sender_role === "fan" && !m.is_read,
      ).length,
    }));
  }

  async getCommunityStats(): Promise<CommunityStats> {
    const fans = await this.getAllFans();
    const byCountry = new Map<string, number>();
    for (const f of fans) {
      byCountry.set(f.country, (byCountry.get(f.country) ?? 0) + 1);
    }
    return {
      total_fans: fans.length,
      tier_none: fans.filter((f) => f.membership_tier === "none").length,
      tier_silver: fans.filter((f) => f.membership_tier === "silver").length,
      tier_gold: fans.filter((f) => f.membership_tier === "gold").length,
      tier_platinum: fans.filter((f) => f.membership_tier === "platinum").length,
      by_country: [...byCountry.entries()]
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  async updateLastSeen(id: string, at: string) {
    await this.updateUser(id, { last_seen_at: at });
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const rows = await this.getRows<SiteSettings>("site_settings");
    if (rows.length === 0) {
      return {
        id: "default",
        celebrity_name: "Morgan Wallen",
        tagline: "Official fan experience — giveaways, meet & greets, and more.",
        hero_video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        updated_at: new Date().toISOString(),
      };
    }
    return rows[0];
  }

  async updateSiteSettings(data: Partial<SiteSettings>) {
    const current = await this.getSiteSettings();
    const updated = { ...current, ...data, updated_at: new Date().toISOString() };
    await this.setRows("site_settings", [updated]);
    return updated;
  }

  async getGiveaways(status?: string) {
    let rows = await this.getRows<Giveaway>("giveaways");
    if (status) rows = rows.filter((g) => g.status === status);
    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getGiveawayById(id: string) {
    return (await this.getGiveaways()).find((g) => g.id === id) ?? null;
  }

  async createGiveaway(data: Omit<Giveaway, "created_at">) {
    const rows = await this.getRows<Giveaway>("giveaways");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("giveaways", rows);
    return item;
  }

  async updateGiveaway(id: string, data: Partial<Giveaway>) {
    const rows = await this.getRows<Giveaway>("giveaways");
    const idx = rows.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error("Giveaway not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("giveaways", rows);
    return rows[idx];
  }

  async deleteGiveaway(id: string) {
    await this.setRows("giveaways", (await this.getRows<Giveaway>("giveaways")).filter((g) => g.id !== id));
    await this.setRows(
      "giveaway_entries",
      (await this.getRows<GiveawayEntry>("giveaway_entries")).filter((e) => e.giveaway_id !== id),
    );
  }

  async getGiveawayEntries(giveawayId: string) {
    return (await this.getRows<GiveawayEntry>("giveaway_entries")).filter((e) => e.giveaway_id === giveawayId);
  }

  async getUserGiveawayEntries(userId: string) {
    return (await this.getRows<GiveawayEntry>("giveaway_entries")).filter((e) => e.user_id === userId);
  }

  async createGiveawayEntry(data: Omit<GiveawayEntry, "created_at">) {
    const rows = await this.getRows<GiveawayEntry>("giveaway_entries");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("giveaway_entries", rows);
    return item;
  }

  async hasGiveawayEntry(giveawayId: string, userId: string) {
    return (await this.getGiveawayEntries(giveawayId)).some((e) => e.user_id === userId);
  }

  async deleteGiveawayEntriesByUser(userId: string) {
    await this.setRows(
      "giveaway_entries",
      (await this.getRows<GiveawayEntry>("giveaway_entries")).filter((e) => e.user_id !== userId),
    );
  }

  async getMeetGreets(status?: string) {
    let rows = await this.getRows<MeetGreet>("meet_greet");
    if (status) rows = rows.filter((e) => e.status === status);
    return rows.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  async getMeetGreetById(id: string) {
    return (await this.getMeetGreets()).find((e) => e.id === id) ?? null;
  }

  async createMeetGreet(data: Omit<MeetGreet, "created_at">) {
    const rows = await this.getRows<MeetGreet>("meet_greet");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("meet_greet", rows);
    return item;
  }

  async updateMeetGreet(id: string, data: Partial<MeetGreet>) {
    const rows = await this.getRows<MeetGreet>("meet_greet");
    const idx = rows.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Event not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("meet_greet", rows);
    return rows[idx];
  }

  async deleteMeetGreet(id: string) {
    await this.setRows("meet_greet", (await this.getRows<MeetGreet>("meet_greet")).filter((e) => e.id !== id));
    await this.setRows(
      "meet_greet_registrations",
      (await this.getRows<MeetGreetRegistration>("meet_greet_registrations")).filter((e) => e.event_id !== id),
    );
  }

  async getMeetGreetRegistrations(eventId: string) {
    return (await this.getRows<MeetGreetRegistration>("meet_greet_registrations")).filter(
      (e) => e.event_id === eventId,
    );
  }

  async getUserMeetGreetRegistrations(userId: string) {
    return (await this.getRows<MeetGreetRegistration>("meet_greet_registrations")).filter(
      (e) => e.user_id === userId,
    );
  }

  async createMeetGreetRegistration(data: Omit<MeetGreetRegistration, "created_at">) {
    const rows = await this.getRows<MeetGreetRegistration>("meet_greet_registrations");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("meet_greet_registrations", rows);
    return item;
  }

  async hasMeetGreetRegistration(eventId: string, userId: string) {
    return (await this.getMeetGreetRegistrations(eventId)).some((e) => e.user_id === userId);
  }

  async deleteMeetGreetRegistrationsByUser(userId: string) {
    await this.setRows(
      "meet_greet_registrations",
      (await this.getRows<MeetGreetRegistration>("meet_greet_registrations")).filter((e) => e.user_id !== userId),
    );
  }

  async getTickets(status?: string) {
    let rows = await this.getRows<Ticket>("tickets");
    if (status) rows = rows.filter((t) => t.status === status);
    return rows.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  async getTicketById(id: string) {
    return (await this.getTickets()).find((t) => t.id === id) ?? null;
  }

  async getTicketByExternalId(externalId: string, sourceName: string) {
    return (
      (await this.getTickets()).find(
        (t) => t.external_id === externalId && t.source_name === sourceName,
      ) ?? null
    );
  }

  async createTicket(data: Omit<Ticket, "created_at">) {
    const rows = await this.getRows<Ticket>("tickets");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("tickets", rows);
    return item;
  }

  async updateTicket(id: string, data: Partial<Ticket>) {
    const rows = await this.getRows<Ticket>("tickets");
    const idx = rows.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Ticket not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("tickets", rows);
    return rows[idx];
  }

  async deleteTicket(id: string) {
    await this.setRows("tickets", (await this.getRows<Ticket>("tickets")).filter((t) => t.id !== id));
    await this.setRows(
      "ticket_orders",
      (await this.getRows<TicketOrder>("ticket_orders")).filter((o) => o.ticket_id !== id),
    );
  }

  async getTicketOrders(filters?: { ticketId?: string; userId?: string; status?: string }) {
    let rows = await this.getRows<TicketOrder>("ticket_orders");
    if (filters?.ticketId) rows = rows.filter((o) => o.ticket_id === filters.ticketId);
    if (filters?.userId) rows = rows.filter((o) => o.user_id === filters.userId);
    if (filters?.status) rows = rows.filter((o) => o.status === filters.status);
    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getTicketOrderById(id: string) {
    return (await this.getTicketOrders()).find((o) => o.id === id) ?? null;
  }

  async createTicketOrder(data: Omit<TicketOrder, "created_at">) {
    const rows = await this.getRows<TicketOrder>("ticket_orders");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("ticket_orders", rows);
    return item;
  }

  async updateTicketOrder(id: string, data: Partial<TicketOrder>) {
    const rows = await this.getRows<TicketOrder>("ticket_orders");
    const idx = rows.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Order not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("ticket_orders", rows);
    return rows[idx];
  }

  async deleteTicketOrdersByUser(userId: string) {
    await this.setRows(
      "ticket_orders",
      (await this.getRows<TicketOrder>("ticket_orders")).filter((o) => o.user_id !== userId),
    );
  }

  async countUserTicketOrders(userId: string) {
    return (await this.getTicketOrders({ userId })).length;
  }

  async getCommunities() {
    return (await this.getRows<Community>("communities")).sort((a, b) => a.sort_order - b.sort_order);
  }

  async createCommunity(data: Omit<Community, "created_at">) {
    const rows = await this.getRows<Community>("communities");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("communities", rows);
    return item;
  }

  async updateCommunity(id: string, data: Partial<Community>) {
    const rows = await this.getRows<Community>("communities");
    const idx = rows.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Community not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("communities", rows);
    return rows[idx];
  }

  async deleteCommunity(id: string) {
    await this.setRows("communities", (await this.getRows<Community>("communities")).filter((c) => c.id !== id));
  }

  async getContactLinks() {
    return await this.getRows<ContactLink>("contact_links");
  }

  async createContactLink(data: Omit<ContactLink, "created_at">) {
    const rows = await this.getRows<ContactLink>("contact_links");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("contact_links", rows);
    return item;
  }

  async updateContactLink(id: string, data: Partial<ContactLink>) {
    const rows = await this.getRows<ContactLink>("contact_links");
    const idx = rows.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Contact link not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("contact_links", rows);
    return rows[idx];
  }

  async deleteContactLink(id: string) {
    await this.setRows("contact_links", (await this.getRows<ContactLink>("contact_links")).filter((c) => c.id !== id));
  }

  async getSiteButtons() {
    return (await this.getRows<SiteButton>("site_buttons")).sort((a, b) => a.sort_order - b.sort_order);
  }

  async createSiteButton(data: Omit<SiteButton, "created_at">) {
    const rows = await this.getRows<SiteButton>("site_buttons");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("site_buttons", rows);
    return item;
  }

  async updateSiteButton(id: string, data: Partial<SiteButton>) {
    const rows = await this.getRows<SiteButton>("site_buttons");
    const idx = rows.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Button not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("site_buttons", rows);
    return rows[idx];
  }

  async deleteSiteButton(id: string) {
    await this.setRows("site_buttons", (await this.getRows<SiteButton>("site_buttons")).filter((b) => b.id !== id));
  }

  async getMessagesByThread(threadId: string) {
    return (await this.getRows<Message>("messages"))
      .filter((m) => m.thread_id === threadId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async getThreadsForUser(userId: string) {
    const messages = await this.getRows<Message>("messages");
    return this.buildThreads(messages, userId, false);
  }

  async getAllThreads() {
    const messages = await this.getRows<Message>("messages");
    const users = await this.getRows<AppUser>("app_users");
    return this.buildThreads(messages, undefined, true, users);
  }

  async createMessage(data: Omit<Message, "created_at">) {
    const rows = await this.getRows<Message>("messages");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("messages", rows);
    return item;
  }

  async markThreadRead(threadId: string, forRole: "fan" | "admin") {
    const rows = await this.getRows<Message>("messages");
    const targetRole = forRole === "fan" ? "admin" : "fan";
    for (const m of rows) {
      if (m.thread_id === threadId && m.sender_role === targetRole) m.is_read = true;
    }
    await this.setRows("messages", rows);
  }

  async deleteMessagesByUser(userId: string) {
    await this.setRows("messages", (await this.getRows<Message>("messages")).filter((m) => m.user_id !== userId));
  }

  async countUserMessages(userId: string) {
    return (await this.getRows<Message>("messages")).filter((m) => m.user_id === userId).length;
  }

  async getNotifications(userId: string) {
    return (await this.getRows<Notification>("notifications"))
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getUnreadNotificationCount(userId: string) {
    return (await this.getNotifications(userId)).filter((n) => !n.is_read).length;
  }

  async createNotification(data: Omit<Notification, "created_at">) {
    const rows = await this.getRows<Notification>("notifications");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("notifications", rows);
    return item;
  }

  async markAllNotificationsRead(userId: string) {
    const rows = await this.getRows<Notification>("notifications");
    for (const n of rows) {
      if (n.user_id === userId) n.is_read = true;
    }
    await this.setRows("notifications", rows);
  }

  async deleteNotificationsByUser(userId: string) {
    await this.setRows(
      "notifications",
      (await this.getRows<Notification>("notifications")).filter((n) => n.user_id !== userId),
    );
  }

  async getMembershipApplications(status?: string) {
    let rows = await this.getRows<MembershipApplication>("membership_applications");
    if (status) rows = rows.filter((a) => a.status === status);
    return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getUserMembershipApplications(userId: string) {
    return (await this.getMembershipApplications()).filter((a) => a.user_id === userId);
  }

  async createMembershipApplication(data: Omit<MembershipApplication, "created_at" | "reviewed_at">) {
    const rows = await this.getRows<MembershipApplication>("membership_applications");
    const item = { ...data, created_at: new Date().toISOString(), reviewed_at: null };
    rows.push(item);
    await this.setRows("membership_applications", rows);
    return item;
  }

  async updateMembershipApplication(id: string, data: Partial<MembershipApplication>) {
    const rows = await this.getRows<MembershipApplication>("membership_applications");
    const idx = rows.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Application not found");
    rows[idx] = { ...rows[idx], ...data };
    await this.setRows("membership_applications", rows);
    return rows[idx];
  }

  async deleteMembershipApplicationsByUser(userId: string) {
    await this.setRows(
      "membership_applications",
      (await this.getRows<MembershipApplication>("membership_applications")).filter((a) => a.user_id !== userId),
    );
  }

  async getPushSubscriptions(userId: string) {
    return (await this.getRows<PushSubscription>("push_subscriptions")).filter((s) => s.user_id === userId);
  }

  async getAllPushSubscriptionsForUsers(userIds: string[]) {
    return (await this.getRows<PushSubscription>("push_subscriptions")).filter((s) =>
      userIds.includes(s.user_id),
    );
  }

  async getAdminPushSubscriptions() {
    const admins = await this.getAllAdmins();
    const ids = admins.map((a) => a.id);
    return (await this.getRows<PushSubscription>("push_subscriptions")).filter((s) => ids.includes(s.user_id));
  }

  async createPushSubscription(data: Omit<PushSubscription, "created_at">) {
    const rows = await this.getRows<PushSubscription>("push_subscriptions");
    const item = { ...data, created_at: new Date().toISOString() };
    rows.push(item);
    await this.setRows("push_subscriptions", rows);
    return item;
  }

  async deletePushSubscription(id: string) {
    await this.setRows(
      "push_subscriptions",
      (await this.getRows<PushSubscription>("push_subscriptions")).filter((s) => s.id !== id),
    );
  }

  async deletePushSubscriptionsByUser(userId: string) {
    await this.setRows(
      "push_subscriptions",
      (await this.getRows<PushSubscription>("push_subscriptions")).filter((s) => s.user_id !== userId),
    );
  }

  async deletePushSubscriptionByEndpoint(endpoint: string) {
    await this.setRows(
      "push_subscriptions",
      (await this.getRows<PushSubscription>("push_subscriptions")).filter((s) => s.endpoint !== endpoint),
    );
  }

  async getFanStats(userId: string): Promise<FanStats> {
    const messages = await this.countUserMessages(userId);
    const entries = (await this.getUserGiveawayEntries(userId)).length;
    const meetGreets = (await this.getUserMeetGreetRegistrations(userId)).length;
    const ticketOrders = await this.countUserTicketOrders(userId);
    const unread = await this.getUnreadNotificationCount(userId);
    return {
      total_messages: messages,
      giveaway_entries: entries,
      meet_greet_requests: meetGreets,
      ticket_orders: ticketOrders,
      unread_notifications: unread,
    };
  }
}

export function createExcelRepository(): Repository {
  return new ExcelRepository();
}

export { uuidv4 };
