import { getRepository } from "@/lib/repository";
import { saveSiteSettingsAction } from "@/actions/admin";

export default async function AdminSettingsPage() {
  const repo = getRepository();
  const settings = await repo.getSiteSettings();

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="font-display text-3xl">Site Settings</h1>
      <form action={saveSiteSettingsAction} className="glass-card space-y-4 p-6">
        <div>
          <label className="label-text">Celebrity name</label>
          <input name="celebrity_name" defaultValue={settings.celebrity_name} required className="input-field" />
        </div>
        <div>
          <label className="label-text">Tagline</label>
          <input name="tagline" defaultValue={settings.tagline} required className="input-field" />
        </div>
        <div>
          <label className="label-text">Hero video URL</label>
          <input name="hero_video_url" defaultValue={settings.hero_video_url} required className="input-field" />
        </div>
        <button type="submit" className="btn-primary text-xs">Save settings</button>
      </form>
    </div>
  );
}
