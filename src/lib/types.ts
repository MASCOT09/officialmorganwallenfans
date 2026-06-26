export type UserRole = "fan" | "admin";
export type MembershipTier = "none" | "silver" | "gold" | "platinum";
export type MembershipStatus = "none" | "pending" | "approved" | "rejected";
export type GiveawayStatus = "draft" | "active" | "closed";
export type MeetGreetStatus = "upcoming" | "closed";
export type TicketStatus = "draft" | "pending_review" | "active" | "sold_out" | "rejected";
export type TicketOrderStatus = "pending" | "confirmed" | "cancelled";
export type MessageSenderRole = "fan" | "admin";
export type MessageStatus = "open" | "closed";
export type ContactRecipient = "artist" | "team";
export type ContactPlatform = "whatsapp" | "zangi" | "telegram";

export interface AppUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
  country: string;
  avatar_url: string | null;
  membership_tier: MembershipTier;
  membership_status: MembershipStatus;
  created_at: string;
  last_seen_at: string | null;
}

export interface AppUserPublic {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  country: string;
  avatar_url: string | null;
  membership_tier: MembershipTier;
  membership_status: MembershipStatus;
  created_at: string;
  last_seen_at: string | null;
}

export interface AdminUserSummary extends AppUserPublic {
  unread_fan_messages?: number;
}

export interface SiteSettings {
  id: string;
  celebrity_name: string;
  tagline: string;
  hero_video_url: string;
  updated_at: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  image_urls: string[] | null;
  status: GiveawayStatus;
  ends_at: string | null;
  created_at: string;
}

export interface GiveawayEntry {
  id: string;
  giveaway_id: string;
  user_id: string;
  created_at: string;
}

export interface MeetGreet {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  max_spots: number;
  status: MeetGreetStatus;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
}

export interface MeetGreetRegistration {
  id: string;
  event_id: string;
  user_id: string;
  is_waitlist: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  event_date: string;
  price_cents: number;
  quantity_available: number;
  image_url: string | null;
  status: TicketStatus;
  external_id: string | null;
  source_name: string | null;
  source_url: string | null;
  fetched_at: string | null;
  created_at: string;
}

export interface TicketOrder {
  id: string;
  ticket_id: string;
  user_id: string;
  quantity: number;
  total_cents: number;
  status: TicketOrderStatus;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  platform: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ContactLink {
  id: string;
  recipient: ContactRecipient;
  platform: ContactPlatform;
  url: string;
  label: string;
  created_at: string;
}

export interface SiteButton {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  user_id: string;
  subject: string;
  body: string;
  image_url: string | null;
  image_urls: string[] | null;
  sender_role: MessageSenderRole;
  is_read: boolean;
  status: MessageStatus;
  created_at: string;
}

export interface MessageThread {
  thread_id: string;
  user_id: string;
  subject: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: MessageStatus;
  fan_display_name?: string;
  fan_last_seen_at?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MembershipApplication {
  id: string;
  user_id: string;
  requested_tier: MembershipTier;
  status: "pending" | "approved" | "rejected";
  note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface FanStats {
  total_messages: number;
  giveaway_entries: number;
  meet_greet_requests: number;
  ticket_orders: number;
  unread_notifications: number;
}

export interface CommunityStats {
  total_fans: number;
  tier_none: number;
  tier_silver: number;
  tier_gold: number;
  tier_platinum: number;
  by_country: { country: string; count: number }[];
}

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  membership_tier: MembershipTier;
  membership_status: MembershipStatus;
  avatar_url: string | null;
  country: string;
}
