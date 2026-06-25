#!/usr/bin/env node
/**
 * One-time production Supabase setup: pending migrations + ticket seed.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
 *
 * Usage:
 *   set SUPABASE_URL=https://xxx.supabase.co
 *   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 *   node scripts/setup-supabase-production.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSql(label, sql) {
  const { error } = await supabase.rpc("exec_sql", { query: sql });
  if (error?.message?.includes("Could not find the function")) {
    // Fallback: use REST /sql if rpc not available — run statements via pg not exposed
    console.log(`  [${label}] Skipped RPC — run this SQL in Supabase SQL Editor if needed.`);
    return false;
  }
  if (error) {
    const msg = error.message ?? String(error);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      console.log(`  [${label}] Already applied.`);
      return true;
    }
    console.error(`  [${label}] Error:`, msg);
    return false;
  }
  console.log(`  [${label}] OK`);
  return true;
}

async function main() {
  console.log("Morgan Wallen Fan — Supabase production setup\n");
  console.log("Project:", url);

  // Check tickets table
  const { error: ticketsErr } = await supabase.from("tickets").select("id").limit(1);
  if (ticketsErr?.message?.includes("does not exist") || ticketsErr?.code === "42P01") {
    console.log("\nTickets tables missing. Apply migrations 007 + 008 in Supabase SQL Editor:");
    console.log("  1. supabase/migrations/007_tickets.sql");
    console.log("  2. supabase/migrations/008_ticket_show_sync.sql");
    console.log("\nOr paste both files into: https://supabase.com/dashboard → SQL Editor → New query\n");
  } else if (ticketsErr) {
    console.error("Tickets check failed:", ticketsErr.message);
  } else {
    console.log("\nTickets table exists.");
    const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      console.log("Seeding ticket listings...");
      const seed = readFileSync(join(process.cwd(), "supabase", "seed_tickets.sql"), "utf8");
      console.log("\nRun this in Supabase SQL Editor:\n");
      console.log(seed);
    } else {
      console.log(`Found ${count} ticket listing(s).`);
    }
  }

  const { data: admins } = await supabase.from("app_users").select("email").eq("role", "admin").limit(3);
  if (admins?.length) {
    console.log("\nAdmin account(s):", admins.map((a) => a.email).join(", "));
  } else {
    console.log("\nNo admin user found. Sign up on the site, then run in SQL Editor:");
    console.log("  UPDATE app_users SET role = 'admin', membership_tier = 'platinum', membership_status = 'approved' WHERE email = 'your@email.com';");
  }

  console.log("\n--- Vercel environment variables ---");
  console.log("NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app");
  console.log("SESSION_SECRET=<random 32+ char string>");
  console.log("SUPABASE_URL=" + url);
  console.log("SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Settings → API → service_role>");
  console.log("RESEND_API_KEY=<optional, for emails>");
  console.log("EMAIL_FROM=Morgan Wallen Fan <onboarding@resend.dev>");
  console.log("ADMIN_ALERT_EMAIL=admin@morganwallen.fan");
}

main().catch(console.error);
