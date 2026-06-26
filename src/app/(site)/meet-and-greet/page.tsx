import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { canRegisterMeetAndGreet } from "@/lib/membership";
import { registerMeetGreetAction } from "@/actions/fan";
import { AuthGateButton } from "@/components/AuthGateButton";
import { MembershipGateButton } from "@/components/MembershipGateButton";
import { PostImage } from "@/components/PostImage";
import { FormSubmitButton } from "@/components/FormSubmitButton";

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
        <div className="mt-12">
          <p className="text-muted">No upcoming events. Check back soon!</p>
          {!session && (
            <AuthGateButton
              isLoggedIn={false}
              redirectPath="/meet-and-greet"
              actionLabel="Sign up or log in"
              className="btn-primary mt-6"
            >
              <></>
            </AuthGateButton>
          )}
        </div>
      ) : (
        <div className="mt-10 grid gap-6">
          {events.map(async (e) => {
            const regs = await repo.getMeetGreetRegistrations(e.id);
            const spotsLeft = e.max_spots - regs.filter((r) => !r.is_waitlist).length;
            return (
              <div key={e.id} className="glass-card p-6">
                {e.image_url && <PostImage src={e.image_url} alt={e.title} className="mb-4 max-h-48 w-full object-cover" />}
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
                  <AuthGateButton
                    isLoggedIn={!!session}
                    redirectPath="/meet-and-greet"
                    actionLabel="Register"
                  >
                    <MembershipGateButton
                      actionLabel="Register"
                      requiredTier="gold"
                      canParticipate={canRegister}
                      isLoggedIn
                      redirectPath="/meet-and-greet"
                    >
                      <form action={registerEvent}>
                        <input type="hidden" name="eventId" value={e.id} />
                        <FormSubmitButton label="Register" pendingLabel="Registering…" />
                      </form>
                    </MembershipGateButton>
                  </AuthGateButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
