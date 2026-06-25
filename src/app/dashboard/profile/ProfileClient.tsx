"use client";

import { useActionState } from "react";
import { updateProfileAction, uploadAvatarAction } from "@/actions/fan";
import { CountryPicker } from "@/components/CountryPicker";

export function ProfileClient({
  displayName,
  country,
  avatarUrl,
}: {
  displayName: string;
  country: string;
  avatarUrl: string | null;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) =>
      updateProfileAction(formData),
    { success: false },
  );
  const [avatarState, avatarAction, avatarPending] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) =>
      uploadAvatarAction(formData),
    { success: false },
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="text-muted">Manage your fan profile.</p>
      </div>

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
            {displayName[0]?.toUpperCase()}
          </span>
        )}
        <form action={avatarAction}>
          <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp" className="text-sm" />
          <button type="submit" disabled={avatarPending} className="btn-secondary mt-2 text-xs">
            {avatarPending ? "Uploading…" : "Upload avatar"}
          </button>
          {avatarState.error && <p className="mt-1 text-xs text-red-400">{avatarState.error}</p>}
        </form>
      </div>

      <form action={profileAction} className="glass-card space-y-4 p-6">
        <div>
          <label className="label-text">Display name</label>
          <input name="display_name" defaultValue={displayName} required className="input-field" />
        </div>
        <div>
          <label className="label-text">Country</label>
          <CountryPicker defaultValue={country} />
        </div>
        {profileState.error && <p className="text-sm text-red-400">{profileState.error}</p>}
        {profileState.success && <p className="text-sm text-secondary">Profile updated!</p>}
        <button type="submit" disabled={profilePending} className="btn-primary text-xs">
          Save profile
        </button>
      </form>
    </div>
  );
}
