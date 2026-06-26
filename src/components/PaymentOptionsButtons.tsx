"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectPaymentMethodAction } from "@/actions/fan";
import type { PaymentMethod } from "@/lib/payment-inbox-shared";

const OPTIONS: { method: PaymentMethod; label: string; letter: string }[] = [
  { method: "paypal", label: "PayPal", letter: "A" },
  { method: "apple_gift_card", label: "Apple Gift Card", letter: "B" },
  { method: "bitcoin", label: "Bitcoin", letter: "C" },
];

interface PaymentOptionsButtonsProps {
  threadId: string;
}

export function PaymentOptionsButtons({ threadId }: PaymentOptionsButtonsProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function choose(method: PaymentMethod) {
    if (pending) return;
    startTransition(async () => {
      const result = await selectPaymentMethodAction(threadId, method);
      if (!result.success) {
        alert(result.error ?? "Could not save your selection.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.method}
          type="button"
          disabled={pending}
          onClick={() => choose(opt.method)}
          className="btn-secondary w-full text-left text-sm disabled:opacity-60"
        >
          <span className="font-medium text-accent">{opt.letter}.</span> {opt.label}
          {pending ? " …" : ""}
        </button>
      ))}
    </div>
  );
}
