export const dynamic = "force-dynamic";

import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { NotificationsClient } from "./NotificationsClient";

export default async function NotificationsPage() {
  const session = await requireAuth();
  const repo = getRepository();
  const notifications = await repo.getNotifications(session.id);
  return <NotificationsClient notifications={notifications} />;
}
