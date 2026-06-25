import { getRepository } from "@/lib/repository";
import { saveMeetGreetAction, deleteMeetGreetAction } from "@/actions/admin";

export default async function AdminMeetGreetPage() {
  const repo = getRepository();
  const events = await repo.getMeetGreets();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Meet & Greet</h1>

      <form action={saveMeetGreetAction} className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg">Create event</h2>
        <input name="title" placeholder="Title" required className="input-field" />
        <textarea name="description" placeholder="Description" required className="input-field" rows={3} />
        <input name="location" placeholder="Location" required className="input-field" />
        <input name="event_date" type="datetime-local" required className="input-field" />
        <input name="max_spots" type="number" defaultValue={10} min={1} className="input-field" />
        <select name="status" className="input-field">
          <option value="upcoming">Upcoming</option>
          <option value="closed">Closed</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notify" /> Notify all fans
        </label>
        <button type="submit" className="btn-primary text-xs">Create</button>
      </form>

      <ul className="space-y-4">
        {events.map((e) => (
          <li key={e.id} className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.location} · {new Date(e.event_date).toLocaleString()} · {e.status}
                </p>
              </div>
              <form action={deleteMeetGreetAction.bind(null, e.id)}>
                <button type="submit" className="text-xs text-red-400 hover:underline">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
