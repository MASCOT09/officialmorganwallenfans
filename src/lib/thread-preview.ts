import { visibleMessageBody } from "./payment-inbox-shared";

export function threadMessagePreview(body: string, maxLength = 160): string {
  const text = visibleMessageBody(body).replace(/\s+/g, " ").trim();
  if (!text) return "Attachment";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
