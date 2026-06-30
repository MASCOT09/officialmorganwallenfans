import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="glass-card group flex flex-col p-5 transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent transition-colors group-hover:bg-accent/25">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-display text-3xl text-accent">{value}</span>
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted">{label}</p>
    </Link>
  );
}
