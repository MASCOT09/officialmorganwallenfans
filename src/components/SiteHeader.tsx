import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-card-border bg-[#222a1e]/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 text-sm font-bold text-cream">
            MW
          </span>
          <span className="font-display text-lg tracking-wide">Morgan Wallen</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/communities" className="text-sm text-muted transition-colors hover:text-foreground">
            Communities
          </Link>
          <Link href="/giveaways" className="text-sm text-muted transition-colors hover:text-foreground">
            Giveaways
          </Link>
          <Link href="/meet-and-greet" className="text-sm text-muted transition-colors hover:text-foreground">
            Meet & Greet
          </Link>
          <Link href="/tickets" className="text-sm text-muted transition-colors hover:text-foreground">
            Tickets
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href={session.role === "admin" ? "/admin" : "/dashboard"}
              className="btn-primary px-5 py-2 text-xs"
            >
              Dashboard
            </Link>
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
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-card-border py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="font-display text-xl">Morgan Wallen</p>
        <p className="mt-2 text-sm text-muted">© {new Date().getFullYear()} All rights reserved.</p>
        <nav className="mt-6 flex justify-center gap-6 text-sm text-muted">
          <Link href="/" className="hover:text-accent">Home</Link>
          <Link href="/communities" className="hover:text-accent">Communities</Link>
          <Link href="/giveaways" className="hover:text-accent">Giveaways</Link>
          <Link href="/meet-and-greet" className="hover:text-accent">Meet & Greet</Link>
          <Link href="/tickets" className="hover:text-accent">Tickets</Link>
        </nav>
      </div>
    </footer>
  );
}
