"use client";

import { useState } from "react";

interface ImageUploadFieldProps {
  name?: string;
  label?: string;
}

export function ImageUploadField({
  name = "image",
  label = "Image (optional)",
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div>
      <label className="label-text">{label}</label>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        className="input-field"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) {
            setPreview(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />
      <p className="mt-1 text-xs text-muted">JPG, PNG, or WebP · max 2MB</p>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-3 max-h-48 rounded-lg border border-card-border object-cover"
        />
      )}
    </div>
  );
}
