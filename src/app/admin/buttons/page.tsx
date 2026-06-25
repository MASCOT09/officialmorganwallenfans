import { getRepository } from "@/lib/repository";
import { saveSiteButtonAction, deleteSiteButtonAction } from "@/actions/admin";

export default async function AdminButtonsPage() {
  const repo = getRepository();
  const buttons = await repo.getSiteButtons();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Button Links</h1>
      <form action={saveSiteButtonAction} className="glass-card space-y-4 p-6">
        <input name="label" placeholder="Label" required className="input-field" />
        <input name="url" placeholder="URL" required className="input-field" />
        <input name="sort_order" type="number" defaultValue={0} className="input-field" />
        <button type="submit" className="btn-primary text-xs">Add button</button>
      </form>
      <ul className="space-y-3">
        {buttons.map((b) => (
          <li key={b.id} className="glass-card flex items-center justify-between p-4">
            <p>{b.label}</p>
            <form action={deleteSiteButtonAction.bind(null, b.id)}>
              <button type="submit" className="text-xs text-red-400">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
