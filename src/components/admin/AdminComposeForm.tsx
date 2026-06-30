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
      <h2 className="font-display text-xl">Compose message</h2>
      <p className="text-sm text-muted">Send a new message to one fan or broadcast to everyone.</p>
      <div>
        <label className="label-text">Select fan</label>
        <select name="fan_id" className="input-field">
          <option value="">Select a fan</option>
          {fans.map((f) => (
            <option key={f.id} value={f.id}>
              {f.display_name} ({f.email})
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="broadcast" /> Broadcast to all fans
      </label>
      <div>
        <label className="label-text">Subject</label>
        <input name="subject" placeholder="Subject" required className="input-field" />
      </div>
      <div>
        <label className="label-text">Message</label>
        <textarea name="body" placeholder="Write your message..." className="input-field" rows={4} />
      </div>
      <ImageUploadField label="Attach image (optional)" />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="notify" defaultChecked /> Send notification &amp; email if offline
      </label>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-secondary">Message sent!</p>}
      <FormSubmitButton label="Send" pendingLabel="Sending…" />
    </form>
  );
}
