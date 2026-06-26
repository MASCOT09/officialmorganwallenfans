import { getRepository } from "@/lib/repository";
import { deleteMeetGreetAction } from "@/actions/admin";
import { AdminMeetGreetForm } from "@/components/admin/AdminMeetGreetForm";
import { PostImageGallery } from "@/components/PostImageGallery";

export default async function AdminMeetGreetPage() {
  const repo = getRepository();
  const events = await repo.getMeetGreets();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Meet & Greet</h1>

      <AdminMeetGreetForm />

      <ul className="space-y-4">
        {events.map((e) => (
          <li key={e.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.location} · {new Date(e.event_date).toLocaleString()} · {e.status}
                </p>
                <PostImageGallery entity={e} alt={e.title} className="mt-3 max-h-40 w-full object-cover" />
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
