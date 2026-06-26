import { v4 as uuidv4 } from "uuid";
import { getRepository } from "./repository";
import { notifyAdmins, notifyUser } from "./notify";
import {
  fanSelectionText,
  followUpMessageText,
  getActivePaymentOptions,
  optionsMessageText,
  paymentMethodLabel,
  paymentRequestLabel,
  paymentThreadSubject,
  threadHasPaymentSelection,
  type PaymentMethod,
  type PaymentRequestContext,
} from "./payment-inbox-shared";

export type { PaymentMethod, PaymentRequestContext } from "./payment-inbox-shared";
export { membershipAmountCents, membershipPlanLabel } from "./payment-inbox-shared";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function startPaymentInbox(
  userId: string,
  context: PaymentRequestContext,
): Promise<string> {
  const repo = getRepository();
  const threadId = uuidv4();
  const subject = paymentThreadSubject(context);

  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: userId,
    subject,
    body: optionsMessageText(context),
    image_url: null,
    image_urls: null,
    sender_role: "admin",
    is_read: false,
    status: "open",
  });

  const item = paymentRequestLabel(context);
  await notifyUser(
    userId,
    "Complete your payment",
    `Open your team inbox to choose a payment method for ${item}.`,
    `${SITE_URL}/dashboard/messages/${threadId}`,
  );

  await notifyAdmins(
    "Payment method needed",
    `A fan requested ${item} and is choosing how to pay.`,
    `${SITE_URL}/admin/messages/${threadId}`,
  );

  return threadId;
}

export async function completePaymentMethodSelection(
  userId: string,
  threadId: string,
  method: PaymentMethod,
): Promise<{ success: boolean; error?: string }> {
  const repo = getRepository();
  const messages = await repo.getMessagesByThread(threadId);

  if (messages.length === 0 || messages[0].user_id !== userId) {
    return { success: false, error: "Conversation not found." };
  }

  if (threadHasPaymentSelection(messages)) {
    return { success: false, error: "You have already selected a payment method." };
  }

  const options = getActivePaymentOptions(messages);
  if (!options) {
    return { success: false, error: "Payment options are no longer available." };
  }

  const subject = messages[0].subject;

  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: userId,
    subject,
    body: fanSelectionText(method),
    image_url: null,
    image_urls: null,
    sender_role: "fan",
    is_read: false,
    status: "open",
  });

  await repo.createMessage({
    id: uuidv4(),
    thread_id: threadId,
    user_id: userId,
    subject,
    body: followUpMessageText(method, options.amountCents),
    image_url: null,
    image_urls: null,
    sender_role: "admin",
    is_read: false,
    status: "open",
  });

  const user = await repo.getUserById(userId);
  await notifyAdmins(
    "Payment method selected",
    `${user?.display_name ?? "A fan"} chose ${paymentMethodLabel(method)} for ${options.planLabel}.`,
    `${SITE_URL}/admin/messages/${threadId}`,
  );

  return { success: true };
}
