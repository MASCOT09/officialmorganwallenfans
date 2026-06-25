import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function SettingsPage() {
  const session = await requireAuth();

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-muted">Account settings for {session.email}</p>
      </div>
      <div className="glass-card p-6">
        <h2 className="font-display text-lg">Account</h2>
        <p className="mt-2 text-sm text-muted">Email: {session.email}</p>
        <p className="mt-1 text-sm text-muted">
          Membership: {session.membership_tier} ({session.membership_status})
        </p>
        <form action={logoutAction} className="mt-6">
          <button type="submit" className="btn-secondary text-xs">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
