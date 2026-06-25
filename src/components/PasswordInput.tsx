"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  name?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}

export function PasswordInput({
  name = "password",
  required = true,
  minLength = 6,
  autoComplete = "new-password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center rounded-xl border border-card-border bg-[#151c12]/85 transition-colors focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/40">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-foreground outline-none placeholder:text-muted/70"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 px-3 py-3 text-muted transition-colors hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
