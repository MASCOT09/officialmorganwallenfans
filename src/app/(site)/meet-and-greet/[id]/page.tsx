import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { canRegisterMeetAndGreet } from "@/lib/membership";
import { registerMeetGreetAction } from "@/actions/fan";
import { AuthGateButton } from "@/components/AuthGateButton";
import { MembershipGateButton } from "@/components/MembershipGateButton";

async function registerEvent(formData: FormData) {
  "use server";
  const id = String(formData.get("eventId") ?? "");
  if (id) await registerMeetGreetAction(id);
}

export default async function MeetGreetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = getRepository();
  const event = await repo.getMeetGreetById(id);
  if (!event || event.status !== "upcoming") notFound();

  const session = await getSession();
  const registered = session ? await repo.hasMeetGreetRegistration(id, session.id) : false;
  const regs = await repo.getMeetGreetRegistrations(id);
  const spotsLeft = event.max_spots - regs.filter((r) => !r.is_waitlist).length;
  const canRegister = canRegisterMeetAndGreet(session);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/meet-and-greet" className="text-sm text-accent hover:underline">
        ← Back to events
      </Link>
      <h1 className="mt-6 font-display text-4xl">{event.title}</h1>
      <p className="mt-4 leading-relaxed text-muted">{event.description}</p>
      <p className="mt-4 text-sm text-accent">
        {event.location} · {new Date(event.event_date).toLocaleString()}
      </p>
      <p className="mt-2 text-sm text-muted">
        {spotsLeft > 0 ? `${spotsLeft} of ${event.max_spots} spots available` : "Event full — waitlist available"}
      </p>
      {registered ? (
        <p className="mt-8 text-secondary">You&apos;re registered!</p>
      ) : (
        <div className="mt-8">
          <AuthGateButton
            isLoggedIn={!!session}
            redirectPath={`/meet-and-greet/${id}`}
            actionLabel="Register for this event"
            className="btn-primary"
          >
            <MembershipGateButton
              actionLabel="Register for this event"
              requiredTier="gold"
              canParticipate={canRegister}
              isLoggedIn
              redirectPath={`/meet-and-greet/${id}`}
              className="btn-primary"
            >
              <form action={registerEvent}>
                <input type="hidden" name="eventId" value={id} />
                <button type="submit" className="btn-primary">
                  Register for this event
                </button>
              </form>
            </MembershipGateButton>
          </AuthGateButton>
        </div>
      )}
    </div>
  );
}
