import Link from "next/link";

export function AdminControlsPanel() {
  return (
    <section className="glass-card border-accent/25 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-accent">Admin controls</p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        You are viewing the fan dashboard as admin. Use these tools to manage giveaways, events,
        fan conversations, and site settings.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/admin/giveaways" className="btn-secondary text-xs">
          Create giveaways
        </Link>
        <Link href="/admin/meet-greet" className="btn-secondary text-xs">
          Create meet &amp; greet events
        </Link>
        <Link href="/admin/messages" className="btn-secondary text-xs">
          Chat with fans
        </Link>
        <Link href="/admin" className="btn-primary text-xs">
          Admin overview
        </Link>
      </div>
    </section>
  );
}
