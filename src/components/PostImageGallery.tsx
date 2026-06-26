import { PostImage } from "@/components/PostImage";
import { getEntityImages } from "@/lib/images";

interface PostImageGalleryProps {
  entity: { image_url?: string | null; image_urls?: string[] | string | null };
  alt: string;
  className?: string;
}

export function PostImageGallery({ entity, alt, className }: PostImageGalleryProps) {
  const images = getEntityImages(entity);
  if (images.length === 0) return null;

  return (
    <div className={`grid gap-2 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
      {images.map((src, index) => (
        <PostImage
          key={`${src.slice(0, 32)}-${index}`}
          src={src}
          alt={`${alt} ${index + 1}`}
          className={className ?? "max-h-72 w-full object-cover"}
        />
      ))}
    </div>
  );
}
