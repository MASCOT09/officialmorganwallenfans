import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage() {
  const session = await requireAuth();
  const repo = getRepository();
  const threads = await repo.getThreadsForUser(session.id);
  return <MessagesClient threads={threads} />;
}
