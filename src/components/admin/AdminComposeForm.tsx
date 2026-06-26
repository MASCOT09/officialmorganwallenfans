"use client";

import { useActionState } from "react";
import { adminComposeAction } from "@/actions/admin";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { ImageUploadField } from "@/components/ImageUploadField";
import type { AppUserPublic } from "@/lib/types";

export function AdminComposeForm({ fans }: { fans: AppUserPublic[] }) {
  const [state, action] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return adminComposeAction(formData);
    },
    { success: false },
  );

  return (
    <form action={action} encType="multipart/form-data" className="glass-card space-y-4 p-6">
      <h2 className="font-display text-lg">Compose message</h2>
      <select name="fan_id" className="input-field">
        <option value="">Select a fan</option>
        {fans.map((f) => (
          <option key={f.id} value={f.id}>
            {f.display_name} ({f.email})
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="broadcast" /> Broadcast to all fans
      </label>
      <input name="subject" placeholder="Subject" required className="input-field" />
      <textarea name="body" placeholder="Message" className="input-field" rows={4} />
      <ImageUploadField label="Attach image (optional)" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked /> Send notification
      </label>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-secondary">Message sent!</p>}
      <FormSubmitButton label="Send" pendingLabel="Sending…" />
    </form>
  );
}
