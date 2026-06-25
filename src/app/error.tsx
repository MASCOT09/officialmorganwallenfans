"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-accent">Error</p>
      <h1 className="mt-4 font-display text-3xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
