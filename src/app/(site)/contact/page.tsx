import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { canContactArtist, canContactManagement, MANAGER_TEAM, SITE_NAME } from "@/lib/membership";
import { redirect } from "next/navigation";

export const metadata = { title: "Private DMs" };

export default async function ContactPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/contact");

  const repo = getRepository();
  const links = await repo.getContactLinks();

  const artistLinks = links.filter((l) => l.recipient === "artist");
  const teamLinks = links.filter((l) => l.recipient === "team");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl">Private DMs</h1>
      <p className="mt-2 text-muted">
        Direct contact links for Morgan Wallen fan community members.
      </p>

      {canContactArtist(session) && artistLinks.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{SITE_NAME}</h2>
          <p className="mt-1 text-sm text-accent">Platinum members only</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {artistLinks.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 text-center transition-colors hover:border-accent/40"
              >
                <p className="text-xs uppercase text-muted">{l.platform}</p>
                <p className="mt-1 font-medium">{l.label}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {canContactManagement(session) && teamLinks.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{MANAGER_TEAM}</h2>
          <p className="mt-1 text-sm text-muted">Silver+ members</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {teamLinks.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 text-center transition-colors hover:border-accent/40"
              >
                <p className="text-xs uppercase text-muted">{l.platform}</p>
                <p className="mt-1 font-medium">{l.label}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {!canContactManagement(session) && (
        <div className="mt-12 glass-card p-6 text-center">
          <p className="text-muted">
            Apply for Silver membership or higher to unlock private DM contact links.
          </p>
        </div>
      )}
    </div>
  );
}
