import { getRepository } from "@/lib/repository";
import { deleteGiveawayAction } from "@/actions/admin";
import { AdminGiveawayForm } from "@/components/admin/AdminGiveawayForm";
import { PostImageGallery } from "@/components/PostImageGallery";

export default async function AdminGiveawaysPage() {
  const repo = getRepository();
  const giveaways = await repo.getGiveaways();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Giveaways</h1>

      <AdminGiveawayForm />

      <ul className="space-y-4">
        {giveaways.map((g) => (
          <li key={g.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{g.title}</p>
                <p className="text-xs text-muted">{g.status}</p>
                <PostImageGallery entity={g} alt={g.title} className="mt-3 max-h-40 w-full object-cover" />
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
