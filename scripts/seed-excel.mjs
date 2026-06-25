#!/usr/bin/env node
import ExcelJS from "exceljs";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const WORKBOOK = join(DATA_DIR, "celebrity-site.xlsx");

const SHEETS = {
  app_users: [
    "id", "email", "password_hash", "display_name", "role", "country",
    "avatar_url", "membership_tier", "membership_status", "created_at", "last_seen_at",
  ],
  site_settings: ["id", "celebrity_name", "tagline", "hero_video_url", "updated_at"],
  giveaways: ["id", "title", "description", "image_url", "status", "ends_at", "created_at"],
  giveaway_entries: ["id", "giveaway_id", "user_id", "created_at"],
  meet_greet: ["id", "title", "description", "location", "event_date", "max_spots", "status", "created_at"],
  meet_greet_registrations: ["id", "event_id", "user_id", "is_waitlist", "created_at"],
  communities: ["id", "name", "description", "platform", "url", "sort_order", "created_at"],
  contact_links: ["id", "recipient", "platform", "url", "label", "created_at"],
  site_buttons: ["id", "label", "url", "sort_order", "created_at"],
  messages: ["id", "thread_id", "user_id", "subject", "body", "sender_role", "is_read", "status", "created_at"],
  notifications: ["id", "user_id", "title", "body", "link", "is_read", "created_at"],
  membership_applications: ["id", "user_id", "requested_tier", "status", "note", "created_at", "reviewed_at"],
  push_subscriptions: ["id", "user_id", "endpoint", "p256dh", "auth", "created_at"],
  tickets: [
    "id", "title", "description", "venue", "city", "event_date",
    "price_cents", "quantity_available", "image_url", "status", "created_at",
    "external_id", "source_name", "source_url", "fetched_at",
  ],
  ticket_orders: ["id", "ticket_id", "user_id", "quantity", "total_cents", "status", "created_at"],
};

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  const wb = new ExcelJS.Workbook();
  for (const [name, headers] of Object.entries(SHEETS)) {
    const ws = wb.addWorksheet(name);
    ws.addRow(headers);
  }

  const adminHash = await bcrypt.hash("admin123", 8);
  const memberHash = await bcrypt.hash("member123", 8);
  const fanHash = await bcrypt.hash("fan123", 8);
  const now = new Date().toISOString();
  const adminId = uuidv4();
  const memberId = uuidv4();
  const fanId = uuidv4();

  const users = wb.getWorksheet("app_users");
  users.addRow([adminId, "admin@morganwallen.fan", adminHash, "Wallen Admin", "admin", "US", "", "platinum", "approved", now, ""]);
  users.addRow([memberId, "member@morganwallen.fan", memberHash, "Gold Member", "fan", "US", "", "gold", "approved", now, ""]);
  users.addRow([fanId, "fan@example.com", fanHash, "Country Fan", "fan", "US", "", "silver", "approved", now, ""]);

  const settings = wb.getWorksheet("site_settings");
  settings.addRow([
    "default",
    "Morgan Wallen",
    "Official fan experience — giveaways, meet & greets, and more.",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    now,
  ]);

  const communities = wb.getWorksheet("communities");
  communities.addRow([uuidv4(), "Official Fan Club", "Join thousands of Morgan Wallen fans.", "Discord", "https://discord.com", 0, now]);
  communities.addRow([uuidv4(), "Behind the Scenes", "Exclusive updates and sneak peeks.", "Facebook", "https://facebook.com", 1, now]);

  const giveawayId = uuidv4();
  const giveaways = wb.getWorksheet("giveaways");
  giveaways.addRow([giveawayId, "Signed Guitar Giveaway", "Win a signed Morgan Wallen guitar!", "", "active", "", now]);

  const events = wb.getWorksheet("meet_greet");
  events.addRow([uuidv4(), "Nashville Meet & Greet", "Meet Morgan Wallen in Nashville.", "Nashville, TN", new Date(Date.now() + 30 * 86400000).toISOString(), 20, "upcoming", now]);

  const tickets = wb.getWorksheet("tickets");
  const addTicket = (title, description, venue, city, daysFromNow, priceCents, quantity) => {
    tickets.addRow([
      uuidv4(),
      title,
      description,
      venue,
      city,
      new Date(Date.now() + daysFromNow * 86400000).toISOString(),
      priceCents,
      quantity,
      "",
      "active",
      now,
      "",
      "",
      "",
      "",
    ]);
  };

  addTicket(
    "Nashville Stadium Show",
    "Catch Morgan Wallen live at Nissan Stadium. Official fan community presale.",
    "Nissan Stadium",
    "Nashville, TN",
    60,
    8999,
    500,
  );
  addTicket(
    "VIP Pit Package — Nashville",
    "Premium pit access plus exclusive merch bundle for fan members.",
    "Bridgestone Arena",
    "Nashville, TN",
    90,
    24999,
    50,
  );
  addTicket(
    "Knoxville Summer Night",
    "One Night At A Time World Tour — fan community seats.",
    "Neyland Stadium",
    "Knoxville, TN",
    75,
    7999,
    350,
  );
  addTicket(
    "Atlanta Country Night",
    "Morgan Wallen live in Atlanta. Limited fan presale inventory.",
    "Mercedes-Benz Stadium",
    "Atlanta, GA",
    120,
    9499,
    400,
  );
  addTicket(
    "Austin Outdoor Show",
    "Outdoor stadium show with fan community early access pricing.",
    "Moody Center",
    "Austin, TX",
    150,
    10999,
    200,
  );

  await wb.xlsx.writeFile(WORKBOOK);
  console.log("Seeded", WORKBOOK);
  console.log("");
  console.log("Admin account:");
  console.log("  Email:    admin@morganwallen.fan");
  console.log("  Password: admin123");
  console.log("");
  console.log("Member account (Gold — can buy tickets, meet & greet):");
  console.log("  Email:    member@morganwallen.fan");
  console.log("  Password: member123");
  console.log("");
  console.log("Fan account (Silver):");
  console.log("  Email:    fan@example.com");
  console.log("  Password: fan123");
}

main().catch(console.error);
