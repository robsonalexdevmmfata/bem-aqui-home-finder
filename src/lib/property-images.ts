import { MOCK_PROPERTY_PHOTOS, pickMockPhoto } from "@/lib/mock-data";

/** URLs do seed Lovable (`/__l5e/...`) e caminhos relativos não carregam no Vercel. */
export function isBrokenPropertyImageUrl(url: string | null | undefined) {
  if (!url) return true;
  const u = url.trim();
  if (!u) return true;
  if (u.startsWith("/__l5e/") || u.includes("/__l5e/")) return true;
  if (u.startsWith("/") && !u.startsWith("//")) return true;
  if (u.includes("placeholder.supabase")) return true;
  if (u.includes("demo-casa") || u.includes("demo-apto") || u.includes("demo-cobertura")) return true;
  // Fora do Unsplash no pitch demo costuma ser asset inexistente.
  if (!u.includes("images.unsplash.com") && !u.includes("supabase.co/storage")) return true;
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
