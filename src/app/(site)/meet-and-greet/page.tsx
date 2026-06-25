import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { canRegisterMeetAndGreet } from "@/lib/membership";
import { registerMeetGreetAction } from "@/actions/fan";
import { MembershipGateButton } from "@/components/MembershipGateButton";

async function registerEvent(formData: FormData) {
  "use server";
  const id = String(formData.get("eventId") ?? "");
  if (id) await registerMeetGreetAction(id);
}

export const metadata = { title: "Meet & Greet" };

export default async function MeetGreetPage() {
  const repo = getRepository();
  const session = await getSession();
  const events = await repo.getMeetGreets("upcoming");
  const canRegister = canRegisterMeetAndGreet(session);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl">Meet & Greet</h1>
      <p className="mt-2 text-muted">Browse exclusive Morgan Wallen fan experiences.</p>

      {events.length === 0 ? (
        <p className="mt-12 text-muted">No upcoming events. Check back soon!</p>
      ) : (
        <div className="mt-10 grid gap-6">
          {events.map(async (e) => {
            const regs = await repo.getMeetGreetRegistrations(e.id);
            const spotsLeft = e.max_spots - regs.filter((r) => !r.is_waitlist).length;
            return (
              <div key={e.id} className="glass-card p-6">
                <h2 className="font-display text-xl">{e.title}</h2>
                <p className="mt-2 text-sm text-muted">{e.description}</p>
                <p className="mt-2 text-xs text-accent">
                  {e.location} · {new Date(e.event_date).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {spotsLeft > 0 ? `${spotsLeft} spots left` : "Waitlist only"}
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href={`/meet-and-greet/${e.id}`} className="btn-secondary text-xs">
                    Details
                  </Link>
                  <MembershipGateButton
                    actionLabel="Register"
                    requiredTier="gold"
                    canParticipate={canRegister}
                    isLoggedIn={!!session}
                    redirectPath="/meet-and-greet"
                  >
                    <form action={registerEvent}>
                      <input type="hidden" name="eventId" value={e.id} />
                      <button type="submit" className="btn-primary text-xs">
                        Register
                      </button>
                    </form>
                  </MembershipGateButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
