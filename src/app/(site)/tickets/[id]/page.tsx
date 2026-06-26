import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/membership";
import { purchaseTicketAction } from "@/actions/fan";
import { AuthGateButton } from "@/components/AuthGateButton";
import { FormSubmitButton } from "@/components/FormSubmitButton";

async function purchaseTicket(formData: FormData) {
  "use server";
  const ticketId = String(formData.get("ticketId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  if (ticketId) await purchaseTicketAction(ticketId, quantity);
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = getRepository();
  const ticket = await repo.getTicketById(id);
  if (!ticket || !["active", "sold_out"].includes(ticket.status)) notFound();

  const session = await getSession();
  const soldOut = ticket.status === "sold_out" || ticket.quantity_available === 0;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/tickets" className="text-sm text-accent hover:underline">
        ← Back to tickets
      </Link>
      <h1 className="mt-6 font-display text-4xl">{ticket.title}</h1>
      <p className="mt-4 leading-relaxed text-muted">{ticket.description}</p>
      <p className="mt-4 text-sm text-accent">
        {ticket.venue}, {ticket.city} · {new Date(ticket.event_date).toLocaleString()}
      </p>
      <p className="mt-2 font-display text-2xl text-foreground">
        {formatPrice(ticket.price_cents)}
      </p>
      <p className="mt-2 text-sm text-muted">
        {soldOut ? "Sold out" : `${ticket.quantity_available} tickets available`}
      </p>

      {!soldOut && (
        <div className="mt-8">
          <AuthGateButton
            actionLabel="Purchase tickets"
            isLoggedIn={!!session}
            redirectPath={`/tickets/${id}`}
            className="btn-primary"
          >
            <form action={purchaseTicket} className="flex flex-wrap items-end gap-4">
              <input type="hidden" name="ticketId" value={id} />
              <div>
                <label htmlFor="quantity" className="mb-1 block text-xs text-muted">
                  Quantity
                </label>
                <select id="quantity" name="quantity" className="input-field w-24">
                  {Array.from({ length: Math.min(10, ticket.quantity_available) }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <FormSubmitButton label="Purchase tickets" pendingLabel="Purchasing…" className="btn-primary" />
            </form>
          </AuthGateButton>
        </div>
      )}
    </div>
  );
}
