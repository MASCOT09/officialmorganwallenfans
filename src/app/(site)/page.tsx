import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { LetterPortrait } from "@/components/LetterPortrait";
import { formatPrice } from "@/lib/membership";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const repo = getRepository();
  const settings = await repo.getSiteSettings();
  const buttons = await repo.getSiteButtons();
  const communities = await repo.getCommunities();
  const tickets = await repo.getTickets("active");

  return (
    <>
      <section className="relative overflow-hidden px-6 pb-20 pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-accent">
            Official Fan Experience
          </p>
          <h1 className="font-display text-5xl md:text-7xl">{settings.celebrity_name}</h1>
          <p className="mt-4 max-w-xl text-muted">{settings.tagline}</p>

          <div className="mt-16 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            <LetterPortrait />

            <div className="glass-card space-y-4 p-8 leading-relaxed text-muted">
              <p>
                Hey y&apos;all, thanks so much for dropping by! Seriously, your support night after night
                out on the road means the absolute world to me. We built this space to bring us all a
                little closer together—packed with exclusive updates, special giveaways, real-deal fan
                experiences, and actual ways for us to connect.
              </p>
              <p>
                If you made it to this page, you are in the exact right spot. My official team handles
                everything sent through here, and they make sure to pass the best notes straight over
                to me. Now, I wish I could text or call every single one of you back, but just know
                that every bit of love is seen, and we&apos;re doing our best to keep finding cool ways
                to stay in touch.
              </p>
              <p>
                Whether you&apos;re here to say a quick hello, check out the latest tour news, or ask
                about meet-and-greets, I&apos;m just incredibly grateful you&apos;re along for the ride.
                Make sure to join the fan page, grab your membership, get your tickets, enter the
                giveaways, and so much more. Let&apos;s all have some fun together!
              </p>
              <p className="text-foreground">Appreciate you guys more than you know.</p>
              <p className="font-display text-lg text-accent">— Morgan Wallen</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/signup" className="btn-primary">
              Join
            </Link>
            <Link href="/communities" className="btn-secondary">
              Communities
            </Link>
            {buttons.map((b) => (
              <a key={b.id} href={b.url} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                {b.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-card-border px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl">Everything in one place</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Link href="/communities" className="glass-card group p-8 transition-colors hover:border-accent/40">
              <h3 className="font-display text-xl">Communities</h3>
              <p className="mt-2 text-sm text-muted">
                Join fan groups on Discord, Facebook, and beyond.
              </p>
              <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                Explore →
              </span>
            </Link>
            <Link href="/giveaways" className="glass-card group p-8 transition-colors hover:border-accent/40">
              <h3 className="font-display text-xl">Giveaways</h3>
              <p className="mt-2 text-sm text-muted">
                Enter exclusive giveaways with your fan membership.
              </p>
              <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                View giveaways →
              </span>
            </Link>
            <Link href="/tickets" className="glass-card group p-8 transition-colors hover:border-accent/40">
              <h3 className="font-display text-xl">Concert Tickets</h3>
              <p className="mt-2 text-sm text-muted">
                Fan community presale for upcoming Morgan Wallen shows.
              </p>
              <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                Browse tickets →
              </span>
            </Link>
            <Link href="/meet-and-greet" className="glass-card group p-8 transition-colors hover:border-accent/40">
              <h3 className="font-display text-xl">Meet & Greet</h3>
              <p className="mt-2 text-sm text-muted">
                Register for exclusive fan experiences on tour.
              </p>
              <span className="mt-4 inline-block text-sm text-accent group-hover:underline">
                View events →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {tickets.length > 0 && (
        <section className="border-t border-card-border px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl">On sale now</h2>
                <p className="mt-2 text-muted">Official fan community ticket listings.</p>
              </div>
              <Link href="/tickets" className="text-sm text-accent hover:underline">
                View all tickets →
              </Link>
            </div>
            <ul className="mt-10 grid gap-4 md:grid-cols-2">
              {tickets.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.id}`}
                    className="glass-card block p-6 transition-colors hover:border-accent/40"
                  >
                    <h3 className="font-display text-lg">{t.title}</h3>
                    <p className="mt-1 text-xs text-accent">
                      {t.venue}, {t.city}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {new Date(t.event_date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-3 text-sm font-medium">
                      {formatPrice(t.price_cents)}
                      {t.quantity_available > 0 && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          · {t.quantity_available} left
                        </span>
                      )}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {communities.length > 0 && (
        <section className="border-t border-card-border px-6 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-display text-3xl">Join the community</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted">
              Create your fan account to enter giveaways, register for meet & greets, and stay
              connected with exclusive updates from Morgan Wallen.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/signup" className="btn-primary">
                Create Account
              </Link>
              <Link href="/login" className="btn-secondary">
                Log In
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
