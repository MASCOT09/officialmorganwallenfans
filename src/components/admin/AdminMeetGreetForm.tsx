"use client";

import { useActionState } from "react";
import { saveMeetGreetAction } from "@/actions/admin";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { ImageUploadField } from "@/components/ImageUploadField";

export function AdminMeetGreetForm() {
  const [state, action] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return saveMeetGreetAction(formData);
    },
    { success: false },
  );

  return (
    <form action={action} encType="multipart/form-data" className="glass-card space-y-4 p-6">
      <h2 className="font-display text-lg">Create event</h2>
      <input name="title" placeholder="Title" required className="input-field" />
      <textarea name="description" placeholder="Description" required className="input-field" rows={3} />
      <ImageUploadField label="Event image (optional)" />
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
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-secondary">Event created!</p>}
      <FormSubmitButton label="Create" pendingLabel="Creating…" />
    </form>
  );
}
