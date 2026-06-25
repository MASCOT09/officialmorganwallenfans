import { getRepository } from "@/lib/repository";
import { saveGiveawayAction, deleteGiveawayAction } from "@/actions/admin";

export default async function AdminGiveawaysPage() {
  const repo = getRepository();
  const giveaways = await repo.getGiveaways();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Giveaways</h1>

      <form action={saveGiveawayAction} className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg">Create giveaway</h2>
        <input name="title" placeholder="Title" required className="input-field" />
        <textarea name="description" placeholder="Description" required className="input-field" rows={3} />
        <input name="image_url" placeholder="Image URL (optional)" className="input-field" />
        <input name="ends_at" type="datetime-local" className="input-field" />
        <select name="status" className="input-field">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notify" /> Notify all fans when active
        </label>
        <button type="submit" className="btn-primary text-xs">Create</button>
      </form>

      <ul className="space-y-4">
        {giveaways.map((g) => (
          <li key={g.id} className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{g.title}</p>
                <p className="text-xs text-muted">{g.status}</p>
              </div>
              <form action={deleteGiveawayAction.bind(null, g.id)}>
                <button type="submit" className="text-xs text-red-400 hover:underline">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
