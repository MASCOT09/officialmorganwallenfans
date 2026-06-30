"use client";

import { useState } from "react";
import { MAX_IMAGES_PER_POST } from "@/lib/images";

interface ImageUploadFieldProps {
  name?: string;
  label?: string;
  multiple?: boolean;
  compact?: boolean;
}

export function ImageUploadField({
  name = "images",
  label = "Images (optional)",
  multiple = true,
  compact = false,
}: ImageUploadFieldProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  return (
    <div>
      <label className="label-text">{label}</label>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        className="input-field"
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length === 0) {
            setPreviews([]);
            return;
          }
          if (files.length > MAX_IMAGES_PER_POST) {
            alert(`You can select up to ${MAX_IMAGES_PER_POST} images.`);
            e.target.value = "";
            setPreviews([]);
            return;
          }
          Promise.all(
            files.map(
              (file) =>
                new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                }),
            ),
          ).then(setPreviews);
        }}
      />
      <p className={`text-xs text-muted ${compact ? "mt-1" : "mt-1"}`}>
        {compact ? "JPG, PNG, or WebP · max 2MB" : `JPG, PNG, or WebP · max 2MB each · up to ${MAX_IMAGES_PER_POST} images`}
      </p>
      {previews.length > 0 && (
        <div className={`mt-3 grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"}`}>
          {previews.map((src, index) => (
            <img
              key={`${src.slice(0, 32)}-${index}`}
              src={src}
              alt={`Preview ${index + 1}`}
              className={`w-full rounded-lg border border-card-border object-cover ${compact ? "max-h-20" : "max-h-32"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
