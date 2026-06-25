import { getRepository } from "@/lib/repository";
import { saveContactLinkAction, deleteContactLinkAction } from "@/actions/admin";

export default async function AdminContactLinksPage() {
  const repo = getRepository();
  const links = await repo.getContactLinks();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Contact Links</h1>
      <form action={saveContactLinkAction} className="glass-card space-y-4 p-6">
        <select name="recipient" className="input-field">
          <option value="artist">Morgan Wallen (Platinum)</option>
          <option value="team">Manager Team (Silver+)</option>
        </select>
        <select name="platform" className="input-field">
          <option value="whatsapp">WhatsApp</option>
          <option value="zangi">Zangi</option>
          <option value="telegram">Telegram</option>
        </select>
        <input name="label" placeholder="Label" required className="input-field" />
        <input name="url" placeholder="URL" required className="input-field" />
        <button type="submit" className="btn-primary text-xs">Add link</button>
      </form>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.id} className="glass-card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{l.label}</p>
              <p className="text-xs text-muted">{l.recipient} · {l.platform}</p>
            </div>
            <form action={deleteContactLinkAction.bind(null, l.id)}>
              <button type="submit" className="text-xs text-red-400">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
