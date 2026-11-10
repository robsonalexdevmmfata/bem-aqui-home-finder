import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, PROPERTY_STATUS } from "@/lib/format";
import { StatusBadge, DemoBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/imoveis")({
  head: () => ({ meta: [{ title: `Aprovar imóveis — ${SITE.name}` }] }),
  component: AdminImoveis,
});

function AdminImoveis() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, slug, price, purpose, status, city, is_demo, created_at")
        .in("status", ["pending", "published", "rejected", "draft"])
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: "published" | "rejected") => {
    const payload: Record<string, unknown> = { status };
    if (status === "published") payload.published_at = new Date().toISOString();
    if (status === "rejected") payload.rejection_reason = "Revisar informações e fotos do anúncio.";
    const { error } = await supabase.from("properties").update(payload).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "published" ? "Imóvel publicado" : "Imóvel recusado");
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Aprovações de imóveis</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="space-y-3">
        {data.map((p) => (
          <article key={p.id} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{p.title}</p>
                  {p.is_demo && <DemoBadge />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatBRL(Number(p.price))} · {p.purpose} · {p.city ?? "—"}
                </p>
              </div>
              <StatusBadge map={PROPERTY_STATUS} value={p.status} />
            </div>
            {p.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="gold" onClick={() => setStatus(p.id, "published")}>Publicar</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "rejected")}>Recusar</Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
