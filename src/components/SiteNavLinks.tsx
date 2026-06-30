"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

// Note: SiteHeader stays server-side; nav links use client component for active state.

export function SiteNavLinks({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/communities", label: "Communities" },
    { href: "/giveaways", label: "Giveaways" },
    { href: "/meet-and-greet", label: "Meet & Greet" },
    { href: "/contact", label: "Private DMs" },
  ];

  function linkClass(href: string) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm transition-colors ${
      active ? "border-b border-accent text-foreground" : "text-muted hover:text-foreground"
    }`;
  }

  return (
    <div className="flex items-center gap-6 md:gap-10">
      <nav className="hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            {isAdmin && (
              <Link href="/admin" className="btn-ghost hidden text-xs sm:inline-flex">
                Admin
              </Link>
            )}
            <Link
              href={isAdmin ? "/dashboard" : "/dashboard"}
              className="btn-primary px-5 py-2 text-xs"
            >
              Dashboard
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost hidden text-xs sm:inline-flex">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary px-5 py-2 text-xs">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
