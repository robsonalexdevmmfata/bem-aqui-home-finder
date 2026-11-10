import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { deletePropertyImage, uploadPropertyImages } from "@/lib/property-media";
import { useAuth } from "@/hooks/use-auth";

export function PropertyMediaUploader({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["property-images", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_images")
        .select("id, url, position, storage_path")
        .eq("property_id", propertyId)
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setUploading(true);
    try {
      const result = await uploadPropertyImages({
        userId: user.id,
        propertyId,
        files: Array.from(files),
        startPosition: images.length,
      });
      toast.success(
        result.usedMockFallback
          ? `${result.saved.length} foto(s) salvas (URL mock — storage indisponível)`
          : `${result.saved.length} foto(s) enviadas`,
      );
      qc.invalidateQueries({ queryKey: ["property-images", propertyId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (img: { id: string; storage_path: string | null }) => {
    try {
      await deletePropertyImage(img);
      toast.success("Foto removida");
      qc.invalidateQueries({ queryKey: ["property-images", propertyId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover");
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-navy">Fotos do imóvel</h2>
          <p className="text-xs text-muted-foreground">JPG/PNG. Se o storage falhar, usamos imagem mockada de demonstração.</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
          <Button type="button" variant="gold" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <ImagePlus /> {uploading ? "Enviando..." : "Adicionar fotos"}
          </Button>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Carregando fotos...</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-xl border">
            <img src={img.url} alt="" className="aspect-[4/3] w-full object-cover" />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
              onClick={() => void remove(img)}
              aria-label="Remover foto"
            >
              <Trash2 />
            </Button>
            {!img.storage_path && (
              <span className="absolute bottom-2 left-2 rounded bg-navy/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold">
                Mock
              </span>
            )}
          </div>
        ))}
      </div>
      {!isLoading && images.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhuma foto ainda. Adicione pelo menos uma para destacar o anúncio.
        </p>
      )}
    </div>
  );
}
