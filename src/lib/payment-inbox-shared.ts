import { MEMBERSHIP_TIERS, formatPrice } from "./membership";
import type { MembershipTier } from "./types";

export type PaymentMethod = "paypal" | "apple_gift_card" | "bitcoin";

export type PaymentRequestContext =
  | {
      type: "membership";
      tier: MembershipTier;
      planLabel: string;
      amountCents: number;
    }
  | {
      type: "ticket";
      ticketTitle: string;
      quantity: number;
      amountCents: number;
      orderId: string;
    };

export type PaymentMarker =
  | {
      kind: "options";
      requestType: "membership" | "ticket";
      planLabel: string;
      amountCents: number;
      tier?: MembershipTier;
      orderId?: string;
      quantity?: number;
    }
  | {
      kind: "followup";
      method: PaymentMethod;
    };

const MARKER_RE = /<!--MW_PAYMENT:(.*?)-->/;

export function encodePaymentMarker(data: PaymentMarker): string {
  return `<!--MW_PAYMENT:${JSON.stringify(data)}-->`;
}

export function parsePaymentMarker(body: string): PaymentMarker | null {
  const match = body.match(MARKER_RE);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as PaymentMarker;
  } catch {
    return null;
  }
}

export function visibleMessageBody(body: string): string {
  return body.replace(MARKER_RE, "").trim();
}

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "paypal":
      return "PayPal";
    case "apple_gift_card":
      return "Apple Gift Card";
    case "bitcoin":
      return "Bitcoin";
  }
}

export function membershipPlanLabel(tier: MembershipTier): string {
  if (tier === "none") return "Membership";
  return `${MEMBERSHIP_TIERS[tier].label} Membership`;
}

export function membershipAmountCents(tier: MembershipTier): number {
  if (tier === "none") return 0;
  return MEMBERSHIP_TIERS[tier].price * 100;
}

function requestLabel(context: PaymentRequestContext): string {
  if (context.type === "membership") return context.planLabel;
  const qty = context.quantity > 1 ? `${context.quantity} tickets — ` : "";
  return `${qty}${context.ticketTitle}`;
}

export function optionsMessageText(context: PaymentRequestContext): string {
  const item = requestLabel(context);
  const amount = formatPrice(context.amountCents);

  const intro =
    context.type === "membership"
      ? `Thank you for applying for the ${item} (${amount}).`
      : `Thank you for your ticket order: ${item} (${amount}).`;

  const marker = encodePaymentMarker({
    kind: "options",
    requestType: context.type,
    planLabel: requestLabel(context),
    amountCents: context.amountCents,
    ...(context.type === "membership"
      ? { tier: context.tier }
      : { orderId: context.orderId, quantity: context.quantity }),
  });

  return `${intro}

To complete your request, please choose how you would like to pay. We currently accept:

A. PayPal
B. Apple Gift Card
C. Bitcoin

Select an option below to continue. Our team is standing by to assist you.

${marker}`;
}

export function fanSelectionText(method: PaymentMethod): string {
  return `I would like to pay via ${paymentMethodLabel(method)}.`;
}

export function followUpMessageText(method: PaymentMethod, amountCents: number): string {
  const amount = formatPrice(amountCents);
  const marker = encodePaymentMarker({ kind: "followup", method });

  if (method === "apple_gift_card") {
    return `Thank you for selecting Apple Gift Card.

Please purchase an Apple Gift Card for ${amount} USD and reply in this thread with your confirmation details so our team can verify your payment.

${marker}`;
  }

  const via = paymentMethodLabel(method);
  return `Thank you for selecting ${via}.

Our team will follow up shortly with your payment authorization details. Please check back in this thread in a few moments.

${marker}`;
}

export function threadHasPaymentSelection(messages: { body: string }[]): boolean {
  return messages.some((m) => parsePaymentMarker(m.body)?.kind === "followup");
}

export function getActivePaymentOptions(
  messages: { body: string }[],
): Extract<PaymentMarker, { kind: "options" }> | null {
  if (threadHasPaymentSelection(messages)) return null;

  for (let i = messages.length - 1; i >= 0; i--) {
    const marker = parsePaymentMarker(messages[i].body);
    if (marker?.kind === "options") return marker;
  }
  return null;
}

export function paymentThreadSubject(context: PaymentRequestContext): string {
  return `Payment — ${requestLabel(context)}`;
}

export function paymentRequestLabel(context: PaymentRequestContext): string {
  return requestLabel(context);
}
