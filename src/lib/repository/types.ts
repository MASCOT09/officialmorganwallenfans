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

export interface Repository {
  // Users
  getUserById(id: string): Promise<AppUser | null>;
  getUserByEmail(email: string): Promise<AppUser | null>;
  createUser(data: Omit<AppUser, "created_at" | "last_seen_at">): Promise<AppUser>;
  updateUser(id: string, data: Partial<AppUser>): Promise<AppUser>;
  deleteUser(id: string): Promise<void>;
  getAllFans(): Promise<AppUserPublic[]>;
  getAllAdmins(): Promise<AppUserPublic[]>;
  getFansForMessaging(): Promise<AdminUserSummary[]>;
  getCommunityStats(): Promise<CommunityStats>;
  updateLastSeen(id: string, at: string): Promise<void>;

  // Site settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings>;

  // Giveaways
  getGiveaways(status?: string): Promise<Giveaway[]>;
  getGiveawayById(id: string): Promise<Giveaway | null>;
  createGiveaway(data: Omit<Giveaway, "created_at">): Promise<Giveaway>;
  updateGiveaway(id: string, data: Partial<Giveaway>): Promise<Giveaway>;
  deleteGiveaway(id: string): Promise<void>;
  getGiveawayEntries(giveawayId: string): Promise<GiveawayEntry[]>;
  getUserGiveawayEntries(userId: string): Promise<GiveawayEntry[]>;
  createGiveawayEntry(data: Omit<GiveawayEntry, "created_at">): Promise<GiveawayEntry>;
  hasGiveawayEntry(giveawayId: string, userId: string): Promise<boolean>;
  deleteGiveawayEntriesByUser(userId: string): Promise<void>;

  // Meet & Greet
  getMeetGreets(status?: string): Promise<MeetGreet[]>;
  getMeetGreetById(id: string): Promise<MeetGreet | null>;
  createMeetGreet(data: Omit<MeetGreet, "created_at">): Promise<MeetGreet>;
  updateMeetGreet(id: string, data: Partial<MeetGreet>): Promise<MeetGreet>;
  deleteMeetGreet(id: string): Promise<void>;
  getMeetGreetRegistrations(eventId: string): Promise<MeetGreetRegistration[]>;
  getUserMeetGreetRegistrations(userId: string): Promise<MeetGreetRegistration[]>;
  createMeetGreetRegistration(data: Omit<MeetGreetRegistration, "created_at">): Promise<MeetGreetRegistration>;
  hasMeetGreetRegistration(eventId: string, userId: string): Promise<boolean>;
  deleteMeetGreetRegistrationsByUser(userId: string): Promise<void>;

  // Tickets
  getTickets(status?: string): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | null>;
  getTicketByExternalId(externalId: string, sourceName: string): Promise<Ticket | null>;
  createTicket(data: Omit<Ticket, "created_at">): Promise<Ticket>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket>;
  deleteTicket(id: string): Promise<void>;
  getTicketOrders(filters?: { ticketId?: string; userId?: string; status?: string }): Promise<TicketOrder[]>;
  getTicketOrderById(id: string): Promise<TicketOrder | null>;
  createTicketOrder(data: Omit<TicketOrder, "created_at">): Promise<TicketOrder>;
  updateTicketOrder(id: string, data: Partial<TicketOrder>): Promise<TicketOrder>;
  deleteTicketOrdersByUser(userId: string): Promise<void>;
  countUserTicketOrders(userId: string): Promise<number>;

  // Communities
  getCommunities(): Promise<Community[]>;
  createCommunity(data: Omit<Community, "created_at">): Promise<Community>;
  updateCommunity(id: string, data: Partial<Community>): Promise<Community>;
  deleteCommunity(id: string): Promise<void>;

  // Contact links
  getContactLinks(): Promise<ContactLink[]>;
  createContactLink(data: Omit<ContactLink, "created_at">): Promise<ContactLink>;
  updateContactLink(id: string, data: Partial<ContactLink>): Promise<ContactLink>;
  deleteContactLink(id: string): Promise<void>;

  // Site buttons
  getSiteButtons(): Promise<SiteButton[]>;
  createSiteButton(data: Omit<SiteButton, "created_at">): Promise<SiteButton>;
  updateSiteButton(id: string, data: Partial<SiteButton>): Promise<SiteButton>;
  deleteSiteButton(id: string): Promise<void>;

  // Messages
  getMessagesByThread(threadId: string): Promise<Message[]>;
  getThreadsForUser(userId: string): Promise<MessageThread[]>;
  getAllThreads(): Promise<MessageThread[]>;
  createMessage(data: Omit<Message, "created_at">): Promise<Message>;
  markThreadRead(threadId: string, forRole: "fan" | "admin"): Promise<void>;
  deleteMessagesByUser(userId: string): Promise<void>;
  countUserMessages(userId: string): Promise<number>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(data: Omit<Notification, "created_at">): Promise<Notification>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotificationsByUser(userId: string): Promise<void>;

  // Membership applications
  getMembershipApplications(status?: string): Promise<MembershipApplication[]>;
  getUserMembershipApplications(userId: string): Promise<MembershipApplication[]>;
  createMembershipApplication(data: Omit<MembershipApplication, "created_at" | "reviewed_at">): Promise<MembershipApplication>;
  updateMembershipApplication(id: string, data: Partial<MembershipApplication>): Promise<MembershipApplication>;
  deleteMembershipApplicationsByUser(userId: string): Promise<void>;

  // Push subscriptions
  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  getAllPushSubscriptionsForUsers(userIds: string[]): Promise<PushSubscription[]>;
  getAdminPushSubscriptions(): Promise<PushSubscription[]>;
  createPushSubscription(data: Omit<PushSubscription, "created_at">): Promise<PushSubscription>;
  deletePushSubscription(id: string): Promise<void>;
  deletePushSubscriptionsByUser(userId: string): Promise<void>;
  deletePushSubscriptionByEndpoint(endpoint: string): Promise<void>;

  // Stats
  getFanStats(userId: string): Promise<FanStats>;
}
