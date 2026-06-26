#!/usr/bin/env node
/**
 * Bootstrap a fresh Morgan Wallen Supabase project after running fresh_install.sql.
 *
 * Usage:
 *   set SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *   node scripts/bootstrap-new-supabase.mjs
 *
 * Optional env:
 *   ADMIN_EMAIL=emmanuelolugoke@gmail.com
 *   ADMIN_PASSWORD=Olugoke123
 *   ADMIN_NAME=Wallen Admin
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL ?? "emmanuelolugoke@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "Olugoke123";
const adminName = process.env.ADMIN_NAME ?? "Wallen Admin";

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Morgan Wallen — bootstrap new Supabase project\n");
  console.log("Project:", url);

  const { data: settings, error: settingsErr } = await supabase
    .from("site_settings")
    .select("celebrity_name")
    .limit(1)
    .maybeSingle();

  if (settingsErr) {
    console.error("\nSchema not ready:", settingsErr.message);
    console.error("\nRun supabase/fresh_install.sql in the new project's SQL Editor first.");
    process.exit(1);
  }

  console.log("\nSite name:", settings?.celebrity_name ?? "(missing)");

  const { count: userCount } = await supabase
    .from("app_users")
    .select("*", { count: "exact", head: true });

  const { data: existingAdmin } = await supabase
    .from("app_users")
    .select("id, email, role")
    .eq("email", adminEmail)
    .maybeSingle();

  if (existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 8);
    const { error } = await supabase
      .from("app_users")
      .update({
        password_hash: passwordHash,
        role: "admin",
        membership_tier: "platinum",
        membership_status: "approved",
        display_name: adminName,
      })
      .eq("id", existingAdmin.id);

    if (error) {
      console.error("Failed to update admin:", error.message);
      process.exit(1);
    }
    console.log("\nUpdated admin account:", adminEmail);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 8);
    const { error } = await supabase.from("app_users").insert({
      id: randomUUID(),
      email: adminEmail,
      password_hash: passwordHash,
      display_name: adminName,
      role: "admin",
      country: "US",
      membership_tier: "platinum",
      membership_status: "approved",
    });

    if (error) {
      console.error("Failed to create admin:", error.message);
      process.exit(1);
    }
    console.log("\nCreated admin account:", adminEmail);
  }

  const { count: ticketCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true });

  const { count: giveawayCount } = await supabase
    .from("giveaways")
    .select("*", { count: "exact", head: true });

  console.log("\nDatabase summary:");
  console.log("  Users:", userCount ?? 0);
  console.log("  Tickets:", ticketCount ?? 0);
  console.log("  Giveaways:", giveawayCount ?? 0, "(empty = clean start)");

  console.log("\n--- Update these env vars ---");
  console.log("SUPABASE_URL=" + url);
  console.log("SUPABASE_SERVICE_ROLE_KEY=<service_role key from new project>");
  console.log("NEXT_PUBLIC_SITE_URL=https://officialmorganwallenfans.vercel.app");
  console.log("\nThen redeploy on Vercel. Keanu Reeves site keeps the old Supabase project.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
