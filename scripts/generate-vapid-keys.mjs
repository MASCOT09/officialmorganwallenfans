#!/usr/bin/env node
import webpush from "web-push";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
const keys = webpush.generateVAPIDKeys();

console.log("VAPID keys generated:\n");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("VAPID_SUBJECT=mailto:admin@morganwallen.fan");

if (existsSync(envPath)) {
  let env = readFileSync(envPath, "utf8");
  const updates = {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: keys.publicKey,
    VAPID_PRIVATE_KEY: keys.privateKey,
  };
  for (const [key, val] of Object.entries(updates)) {
    if (env.includes(key + "=")) {
      env = env.replace(new RegExp(`${key}=.*`), `${key}=${val}`);
    } else {
      env += `\n${key}=${val}`;
    }
  }
  writeFileSync(envPath, env);
  console.log("\nUpdated .env.local");
} else {
  console.log("\nAdd these to your .env.local file.");
}
