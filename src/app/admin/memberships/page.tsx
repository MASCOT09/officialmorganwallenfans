import { getRepository } from "@/lib/repository";
import { reviewMembershipAction } from "@/actions/admin";

export default async function AdminMembershipsPage() {
  const repo = getRepository();
  const applications = await repo.getMembershipApplications("pending");

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Membership Applications</h1>
      {applications.length === 0 ? (
        <p className="text-muted">No pending applications.</p>
      ) : (
        <ul className="space-y-4">
          {await Promise.all(
            applications.map(async (app) => {
              const user = await repo.getUserById(app.user_id);
              return (
                <li key={app.id} className="glass-card p-4">
                  <p className="font-medium">
                    {user?.display_name} — {app.requested_tier}
                  </p>
                  <p className="text-xs text-muted">{user?.email}</p>
                  <div className="mt-4 flex gap-3">
                    <form action={reviewMembershipAction.bind(null, app.id, true)}>
                      <button type="submit" className="btn-primary text-xs">Approve</button>
                    </form>
                    <form action={reviewMembershipAction.bind(null, app.id, false)}>
                      <button type="submit" className="btn-secondary text-xs">Reject</button>
                    </form>
                  </div>
                </li>
              );
            }),
          )}
        </ul>
      )}
    </div>
  );
}
