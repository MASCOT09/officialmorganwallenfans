import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { formatPrice } from "@/lib/membership";

export default async function DashboardTicketsPage() {
  const session = await requireAuth();
  const repo = getRepository();
  const orders = await repo.getTicketOrders({ userId: session.id });
  const items = await Promise.all(
    orders.map(async (order) => ({
      order,
      ticket: await repo.getTicketById(order.ticket_id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">My Tickets</h1>
        <p className="text-muted">Your concert ticket orders.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-muted">
          No ticket orders yet.{" "}
          <Link href="/tickets" className="text-accent hover:underline">
            Browse shows
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ order, ticket }) => (
            <li key={order.id} className="glass-card p-4">
              <p className="font-medium">{ticket?.title ?? "Unknown show"}</p>
              <p className="text-xs text-muted">
                {order.quantity} ticket{order.quantity > 1 ? "s" : ""} ·{" "}
                {formatPrice(order.total_cents)} ·{" "}
                <span
                  className={
                    order.status === "confirmed"
                      ? "text-accent"
                      : order.status === "cancelled"
                        ? "text-red-400"
                        : "text-secondary"
                  }
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </p>
              {ticket && (
                <p className="mt-1 text-xs text-muted">
                  {ticket.venue}, {ticket.city} ·{" "}
                  {new Date(ticket.event_date).toLocaleString()}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                Ordered {new Date(order.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
