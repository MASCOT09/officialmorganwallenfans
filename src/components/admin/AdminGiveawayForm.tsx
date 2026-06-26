"use client";

import { useActionState } from "react";
import { saveGiveawayAction } from "@/actions/admin";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { ImageUploadField } from "@/components/ImageUploadField";

export function AdminGiveawayForm() {
  const [state, action] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return saveGiveawayAction(formData);
    },
    { success: false },
  );

  return (
    <form action={action} encType="multipart/form-data" className="glass-card space-y-4 p-6">
      <h2 className="font-display text-lg">Create giveaway</h2>
      <input name="title" placeholder="Title" required className="input-field" />
      <textarea name="description" placeholder="Description" required className="input-field" rows={3} />
      <ImageUploadField label="Giveaway images (optional)" />
      <input name="ends_at" type="datetime-local" className="input-field" />
      <select name="status" className="input-field">
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" /> Notify all fans when active
      </label>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-secondary">Giveaway created!</p>}
      <FormSubmitButton label="Create" pendingLabel="Creating…" />
    </form>
  );
}
