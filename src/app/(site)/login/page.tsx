"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const signupHref = redirect
    ? `/signup?redirect=${encodeURIComponent(redirect)}`
    : "/signup";

  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return loginAction(formData);
    },
    { success: false },
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-accent">Official Fan Experience</p>
      <h1 className="mt-2 font-display text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        {redirect
          ? "Sign in to continue to that page."
          : "Log in to enter giveaways and register for events with Morgan Wallen."}
      </p>

      <form action={action} className="mt-10 space-y-5">
        <input type="hidden" name="redirect" value={redirect} />
        <div>
          <label className="label-text">Email</label>
          <input name="email" type="email" required className="input-field" />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input name="password" type="password" required className="input-field" />
        </div>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-6 py-16 text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
