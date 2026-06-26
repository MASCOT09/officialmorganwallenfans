const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export async function readImageFromFormData(
  formData: FormData,
  field = "image",
): Promise<{ data: string | null; error?: string }> {
  const file = formData.get(field);
  if (file && file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { data: null, error: "Image must be under 2MB." };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { data: null, error: "Only JPG, PNG, and WebP images are allowed." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return { data: `data:${file.type};base64,${buffer.toString("base64")}` };
  }

  const url = String(formData.get("image_url") ?? "").trim();
  return { data: url || null };
}
