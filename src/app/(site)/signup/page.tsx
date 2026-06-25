"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction } from "@/actions/auth";
import { CountryPicker } from "@/components/CountryPicker";
import { PasswordInput } from "@/components/PasswordInput";

function SignupForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";

  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; error?: string; suggestion?: string }, formData: FormData) => {
      return signupAction(formData);
    },
    { success: false },
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-accent">Official Fan Experience</p>
      <h1 className="mt-2 font-display text-3xl">Join the fan community</h1>
      <p className="mt-2 text-sm text-muted">
        {redirect
          ? "Create your account to continue."
          : "Create your account to unlock giveaways, events, and exclusive updates from Morgan Wallen."}
      </p>

      <form action={action} className="mt-10 space-y-5">
        <input type="hidden" name="redirect" value={redirect} />
        <div>
          <label className="label-text">Display name</label>
          <input name="display_name" type="text" required className="input-field" />
        </div>
        <div>
          <label className="label-text">Email</label>
          <input name="email" type="email" required className="input-field" />
          {state.error && (
            <p className="mt-2 text-sm text-red-400">
              {state.error}
              {state.suggestion && (
                <>
                  {" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      const input = document.querySelector<HTMLInputElement>('input[name="email"]');
                      if (input) input.value = state.suggestion!;
                    }}
                  >
                    Use {state.suggestion}
                  </button>
                </>
              )}
            </p>
          )}
        </div>
        <div>
          <label className="label-text">Country</label>
          <CountryPicker />
        </div>
        <div>
          <label className="label-text">Password</label>
          <PasswordInput />
        </div>
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-16 text-muted">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
