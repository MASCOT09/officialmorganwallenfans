"use client";

import { useFormStatus } from "react-dom";

interface FormSubmitButtonProps {
  label: string;
  pendingLabel: string;
  className?: string;
}

export function FormSubmitButton({
  label,
  pendingLabel,
  className = "btn-primary text-xs",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}
