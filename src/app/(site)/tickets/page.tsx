import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/membership";
import { purchaseTicketAction } from "@/actions/fan";
import { AuthGateButton } from "@/components/AuthGateButton";

async function purchaseTicket(formData: FormData) {
  "use server";
  const ticketId = String(formData.get("ticketId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (ticketId) await purchaseTicketAction(ticketId, quantity);
}

export const metadata = { title: "Concert Tickets" };

export default async function TicketsPage() {
  const repo = getRepository();
  const session = await getSession();
  const tickets = await repo.getTickets("active");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl">Concert Tickets</h1>
      <p className="mt-2 text-muted">Browse official Morgan Wallen fan community ticket listings.</p>

      {tickets.length === 0 ? (
        <p className="mt-12 text-muted">No tickets on sale right now. Check back soon!</p>
      ) : (
        <div className="mt-10 grid gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="glass-card p-6">
              <h2 className="font-display text-xl">{t.title}</h2>
              <p className="mt-2 text-sm text-muted">{t.description}</p>
              <p className="mt-2 text-xs text-accent">
                {t.venue}, {t.city} · {new Date(t.event_date).toLocaleString()}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatPrice(t.price_cents)} · {t.quantity_available} left
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/tickets/${t.id}`} className="btn-secondary text-xs">
                  Details
                </Link>
                {t.quantity_available > 0 && (
                  <AuthGateButton
                    actionLabel="Purchase"
                    isLoggedIn={!!session}
                    redirectPath="/tickets"
                  >
                    <form action={purchaseTicket} className="flex items-center gap-2">
                      <input type="hidden" name="ticketId" value={t.id} />
                      <select name="quantity" className="input-field w-20 py-1 text-xs">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn-primary text-xs">
                        Purchase
                      </button>
                    </form>
                  </AuthGateButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
