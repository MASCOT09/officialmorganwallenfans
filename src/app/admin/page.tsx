import Link from "next/link";

const LINKS = [
  { href: "/admin/giveaways", label: "Manage Giveaways" },
  { href: "/admin/meet-greet", label: "Manage Meet & Greet" },
  { href: "/admin/messages", label: "Fan Messages" },
  { href: "/admin/memberships", label: "Membership Applications" },
  { href: "/admin/communities", label: "Communities" },
  { href: "/admin/contact-links", label: "Contact Links" },
  { href: "/admin/buttons", label: "Button Links" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/team", label: "Team & Admins" },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Overview</h1>
        <p className="text-muted">Morgan Wallen fan community admin panel.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="glass-card p-5 transition-colors hover:border-accent/40"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
