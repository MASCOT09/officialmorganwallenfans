import { getRepository } from "@/lib/repository";
import { saveCommunityAction, deleteCommunityAction } from "@/actions/admin";

export default async function AdminCommunitiesPage() {
  const repo = getRepository();
  const communities = await repo.getCommunities();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Communities</h1>
      <form action={saveCommunityAction} className="glass-card space-y-4 p-6">
        <input name="name" placeholder="Name" required className="input-field" />
        <textarea name="description" placeholder="Description" className="input-field" rows={2} />
        <input name="platform" placeholder="Platform (Discord, Facebook…)" className="input-field" />
        <input name="url" placeholder="URL" required className="input-field" />
        <input name="sort_order" type="number" defaultValue={0} className="input-field" />
        <button type="submit" className="btn-primary text-xs">Add community</button>
      </form>
      <ul className="space-y-3">
        {communities.map((c) => (
          <li key={c.id} className="glass-card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted">{c.platform}</p>
            </div>
            <form action={deleteCommunityAction.bind(null, c.id)}>
              <button type="submit" className="text-xs text-red-400">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
