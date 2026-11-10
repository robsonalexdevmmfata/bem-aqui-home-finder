import { supabase } from "@/integrations/supabase/client";
import { pickMockPhoto } from "@/lib/mock-data";

export type PropertyImageRow = {
  id: string;
  url: string;
  position: number;
  storage_path: string | null;
};

/** Tenta Storage; se falhar, grava URL mockada (demo) em property_images. */
export async function uploadPropertyImages(opts: {
  userId: string;
  propertyId: string;
  files: File[];
  startPosition?: number;
}) {
  const { userId, propertyId, files, startPosition = 0 } = opts;
  const saved: PropertyImageRow[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const position = startPosition + i;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${propertyId}/${Date.now()}-${i}.${ext}`;

    let url = pickMockPhoto(position + propertyId.length);
    let storagePath: string | null = null;

    const { error: upErr } = await supabase.storage.from("property-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

    if (!upErr) {
      const { data } = supabase.storage.from("property-media").getPublicUrl(path);
      url = data.publicUrl;
      storagePath = path;
    }

    const { data: row, error } = await supabase
      .from("property_images")
      .insert({
        property_id: propertyId,
        url,
        storage_path: storagePath,
        position,
      })
      .select("id, url, position, storage_path")
      .single();

    if (error) throw error;
    saved.push(row as PropertyImageRow);
  }

  return { saved, usedMockFallback: saved.some((s) => !s.storage_path) };
}

export async function deletePropertyImage(image: { id: string; storage_path: string | null }) {
  if (image.storage_path) {
    await supabase.storage.from("property-media").remove([image.storage_path]);
  }
  const { error } = await supabase.from("property_images").delete().eq("id", image.id);
  if (error) throw error;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printReport(title: string) {
  document.title = title;
  window.print();
}
