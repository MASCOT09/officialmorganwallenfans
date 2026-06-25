import webpush from "web-push";
import { getRepository } from "./repository";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  ensureConfigured();
  if (!configured) return;
  const repo = getRepository();
  const subs = await repo.getPushSubscriptions(userId);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await repo.deletePushSubscriptionByEndpoint(sub.endpoint);
        }
        console.error("[push] Failed:", err);
      }
    }),
  );
}

export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string },
) {
  ensureConfigured();
  if (!configured) return;
  const repo = getRepository();
  const subs = await repo.getAllPushSubscriptionsForUsers(userIds);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await repo.deletePushSubscriptionByEndpoint(sub.endpoint);
        }
      }
    }),
  );
}

export async function sendPushToAdmins(payload: { title: string; body: string; url?: string }) {
  ensureConfigured();
  if (!configured) return;
  const repo = getRepository();
  const subs = await repo.getAdminPushSubscriptions();
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await repo.deletePushSubscriptionByEndpoint(sub.endpoint);
        }
      }
    }),
  );
}

export async function sendPushToAllFans(payload: { title: string; body: string; url?: string }) {
  const repo = getRepository();
  const fans = await repo.getAllFans();
  await sendPushToUsers(
    fans.map((f) => f.id),
    payload,
  );
}
