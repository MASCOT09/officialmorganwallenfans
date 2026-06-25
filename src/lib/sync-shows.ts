import { v4 as uuidv4 } from "uuid";
import { getRepository } from "./repository";
import { fetchMorganWallenShowsFromTicketmaster } from "./ticket-sources/ticketmaster";
import { notifyAdminsPendingShows } from "./notify";

export interface SyncShowsResult {
  imported: number;
  skipped: number;
  total_fetched: number;
}

export async function syncMorganWallenShows(): Promise<SyncShowsResult> {
  const fetched = await fetchMorganWallenShowsFromTicketmaster();
  const repo = getRepository();
  let imported = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const show of fetched) {
    const existing = await repo.getTicketByExternalId(show.external_id, show.source_name);
    if (existing) {
      skipped += 1;
      continue;
    }

    await repo.createTicket({
      id: uuidv4(),
      title: show.title,
      description: show.description,
      venue: show.venue,
      city: show.city,
      event_date: show.event_date,
      price_cents: show.price_cents,
      quantity_available: 0,
      image_url: show.image_url,
      status: "pending_review",
      external_id: show.external_id,
      source_name: show.source_name,
      source_url: show.source_url,
      fetched_at: now,
    });
    imported += 1;
  }

  if (imported > 0) {
    await notifyAdminsPendingShows(imported);
  }

  return { imported, skipped, total_fetched: fetched.length };
}
