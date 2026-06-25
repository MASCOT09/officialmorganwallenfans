import Link from "next/link";
import { getRepository } from "@/lib/repository";
import {
  saveTicketAction,
  deleteTicketAction,
  updateTicketOrderStatusAction,
  fetchShowsNowAction,
  approveTicketListingAction,
  rejectTicketListingAction,
} from "@/actions/admin";
import { formatPrice } from "@/lib/membership";

export default async function AdminTicketsPage() {
  const repo = getRepository();
  const ticketmasterEnabled = !!process.env.TICKETMASTER_API_KEY;
  const allTickets = await repo.getTickets();
  const pending = allTickets.filter((t) => t.status === "pending_review");
  const listings = allTickets.filter(
    (t) => t.status !== "pending_review" && t.status !== "rejected",
  );
  const rejected = allTickets.filter((t) => t.status === "rejected");
  const orders = await repo.getTicketOrders();
  const ordersWithDetails = await Promise.all(
    orders.map(async (order) => ({
      order,
      ticket: await repo.getTicketById(order.ticket_id),
      user: await repo.getUserById(order.user_id),
    })),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Concert Tickets</h1>
          <p className="mt-1 text-sm text-muted">
            {ticketmasterEnabled
              ? "Fetched shows require approval before fans can purchase."
              : "Create and manage fan ticket listings. Auto-fetch from Ticketmaster can be enabled later."}
          </p>
        </div>
        {ticketmasterEnabled && (
          <form action={fetchShowsNowAction}>
            <button type="submit" className="btn-primary text-xs">
              Fetch Morgan Wallen shows
            </button>
          </form>
        )}
      </div>

      {pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl text-accent">
            Awaiting approval ({pending.length})
          </h2>
          {pending.map((t) => (
            <div key={t.id} className="glass-card space-y-4 border border-accent/30 p-6">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted">
                  {t.venue}, {t.city} · {new Date(t.event_date).toLocaleString()}
                </p>
                {t.source_name && (
                  <p className="mt-1 text-xs text-muted">
                    Source: {t.source_name}
                    {t.source_url && (
                      <>
                        {" · "}
                        <Link href={t.source_url} target="_blank" className="text-accent hover:underline">
                          View on Ticketmaster
                        </Link>
                      </>
                    )}
                  </p>
                )}
                <p className="mt-2 text-sm text-muted line-clamp-3">{t.description}</p>
              </div>

              <form action={approveTicketListingAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input type="hidden" name="id" value={t.id} />
                <div>
                  <label className="mb-1 block text-xs text-muted">Fan price (USD)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    defaultValue={t.price_cents > 0 ? (t.price_cents / 100).toFixed(2) : ""}
                    placeholder="89.99"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">Tickets available</label>
                  <input
                    name="quantity_available"
                    type="number"
                    min={1}
                    required
                    defaultValue={100}
                    className="input-field"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="notify" defaultChecked />
                    Notify fans
                  </label>
                </div>
                <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
                  <button type="submit" className="btn-primary text-xs">Approve & publish</button>
                </div>
              </form>
              <form action={rejectTicketListingAction.bind(null, t.id)}>
                <button type="submit" className="text-xs text-red-400 hover:underline">Reject listing</button>
              </form>
            </div>
          ))}
        </section>
      )}

      <form action={saveTicketAction} className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg">Create ticket listing manually</h2>
        <input name="title" placeholder="Show title" required className="input-field" />
        <textarea name="description" placeholder="Description" required className="input-field" rows={3} />
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="venue" placeholder="Venue" required className="input-field" />
          <input name="city" placeholder="City" required className="input-field" />
        </div>
        <input name="event_date" type="datetime-local" required className="input-field" />
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="price" type="number" step="0.01" min={0} placeholder="Price (USD)" required className="input-field" />
          <input name="quantity_available" type="number" defaultValue={100} min={0} placeholder="Quantity" className="input-field" />
        </div>
        <input name="image_url" placeholder="Image URL (optional)" className="input-field" />
        <select name="status" className="input-field">
          <option value="draft">Draft</option>
          <option value="active">Active (skip approval)</option>
          <option value="sold_out">Sold out</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notify" /> Notify all fans when active
        </label>
        <button type="submit" className="btn-primary text-xs">Create</button>
      </form>

      <section>
        <h2 className="font-display text-xl">Published listings</h2>
        <ul className="mt-4 space-y-4">
          {listings.length === 0 ? (
            <p className="text-sm text-muted">No published listings yet.</p>
          ) : (
            listings.map((t) => (
              <li key={t.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted">
                      {t.venue}, {t.city} · {formatPrice(t.price_cents)} · {t.quantity_available} left · {t.status}
                    </p>
                    <p className="text-xs text-muted">{new Date(t.event_date).toLocaleString()}</p>
                  </div>
                  <form action={deleteTicketAction.bind(null, t.id)}>
                    <button type="submit" className="text-xs text-red-400 hover:underline">Delete</button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {rejected.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-muted">Rejected ({rejected.length})</h2>
          <ul className="mt-4 space-y-2">
            {rejected.map((t) => (
              <li key={t.id} className="glass-card p-4 opacity-60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-muted">
                      {t.venue}, {t.city} · {new Date(t.event_date).toLocaleString()}
                    </p>
                  </div>
                  <form action={deleteTicketAction.bind(null, t.id)}>
                    <button type="submit" className="text-xs text-red-400 hover:underline">Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl">Orders</h2>
        {ordersWithDetails.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {ordersWithDetails.map(({ order, ticket, user }) => (
              <li key={order.id} className="glass-card p-4">
                <p className="font-medium">
                  {user?.display_name ?? "Unknown"} — {ticket?.title ?? "Unknown show"}
                </p>
                <p className="text-xs text-muted">
                  {order.quantity} × {formatPrice(ticket?.price_cents ?? 0)} = {formatPrice(order.total_cents)} · {order.status}
                </p>
                <p className="text-xs text-muted">{user?.email}</p>
                {order.status === "pending" && (
                  <div className="mt-3 flex gap-3">
                    <form action={updateTicketOrderStatusAction.bind(null, order.id, "confirmed")}>
                      <button type="submit" className="btn-primary text-xs">Confirm</button>
                    </form>
                    <form action={updateTicketOrderStatusAction.bind(null, order.id, "cancelled")}>
                      <button type="submit" className="btn-secondary text-xs">Cancel</button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
