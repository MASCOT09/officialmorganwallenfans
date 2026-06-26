const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGES_PER_POST = 10;

export function getEntityImages(entity: {
  image_url?: string | null;
  image_urls?: string[] | string | null;
}): string[] {
  if (Array.isArray(entity.image_urls) && entity.image_urls.length > 0) {
    return entity.image_urls;
  }
  if (typeof entity.image_urls === "string" && entity.image_urls.trim()) {
    try {
      const parsed = JSON.parse(entity.image_urls) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
    } catch {
      /* ignore */
    }
  }
  if (entity.image_url) return [entity.image_url];
  return [];
}

export function toImageFields(images: string[]): {
  image_url: string | null;
  image_urls: string[];
} {
  return {
    image_url: images[0] ?? null,
    image_urls: images,
  };
}

async function fileToDataUrl(file: File): Promise<{ data: string | null; error?: string }> {
  if (file.size > MAX_IMAGE_BYTES) {
    return { data: null, error: "Each image must be under 2MB." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { data: null, error: "Only JPG, PNG, and WebP images are allowed." };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { data: `data:${file.type};base64,${buffer.toString("base64")}` };
}

export async function readImagesFromFormData(
  formData: FormData,
  field = "images",
): Promise<{ data: string[]; error?: string }> {
  const files = formData
    .getAll(field)
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (files.length > MAX_IMAGES_PER_POST) {
    return { data: [], error: `You can upload up to ${MAX_IMAGES_PER_POST} images.` };
  }

  const images: string[] = [];
  for (const file of files) {
    const result = await fileToDataUrl(file);
    if (result.error) return { data: [], error: result.error };
    if (result.data) images.push(result.data);
  }

  if (images.length === 0) {
    const legacy = formData.get("image");
    if (legacy instanceof File && legacy.size > 0) {
      const result = await fileToDataUrl(legacy);
      if (result.error) return { data: [], error: result.error };
      if (result.data) images.push(result.data);
    }
  }

  const url = String(formData.get("image_url") ?? "").trim();
  if (images.length === 0 && url) images.push(url);

  return { data: images };
}

/** @deprecated Use readImagesFromFormData */
export async function readImageFromFormData(
  formData: FormData,
  field = "image",
): Promise<{ data: string | null; error?: string }> {
  const images = await readImagesFromFormData(formData, field === "image" ? "images" : field);
  if (images.error) return { data: null, error: images.error };
  return { data: images.data[0] ?? null };
}
