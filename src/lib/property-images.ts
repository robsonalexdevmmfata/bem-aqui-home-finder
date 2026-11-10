import { MOCK_PROPERTY_PHOTOS, pickMockPhoto } from "@/lib/mock-data";

/** URLs do seed Lovable (`/__l5e/...`) e caminhos relativos não carregam no Vercel. */
export function isBrokenPropertyImageUrl(url: string | null | undefined) {
  if (!url) return true;
  if (url.startsWith("/__l5e/")) return true;
  if (url.includes("/__l5e/assets")) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (url.includes("placeholder.supabase")) return true;
  return false;
}

export function resolvePropertyImageUrl(url: string | null | undefined, seed = 0) {
  if (!isBrokenPropertyImageUrl(url)) return url as string;
  return pickMockPhoto(seed);
}

export function withResolvedImages<T extends { id?: string; images?: { url: string; position: number }[] | null }>(
  property: T,
  seedOffset = 0,
): T {
  const images = [...(property.images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((img, i) => ({
      ...img,
      url: resolvePropertyImageUrl(img.url, hashSeed(property.id ?? "", i + seedOffset)),
    }));

  if (!images.length) {
    return {
      ...property,
      images: [{ url: pickMockPhoto(hashSeed(property.id ?? "", seedOffset)), position: 0 }],
    };
  }

  return { ...property, images };
}

function hashSeed(id: string, extra = 0) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h + extra;
}

export const PROPERTY_PHOTO_POOL = MOCK_PROPERTY_PHOTOS;
