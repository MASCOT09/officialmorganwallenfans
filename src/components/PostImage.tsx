"use client";

import { useState } from "react";

interface PostImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function PostImage({ src, alt, className }: PostImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 block w-full overflow-hidden rounded-lg border border-card-border text-left transition-opacity hover:opacity-90"
      >
        <img
          src={src}
          alt={alt}
          className={className ?? "max-h-72 w-full object-cover"}
        />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
