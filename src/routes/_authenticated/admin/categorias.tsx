import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  head: () => ({ meta: [{ title: `Categorias — ${SITE.name}` }] }),
  component: AdminCategorias,
});

function AdminCategorias() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [localMock, setLocalMock] = useState(MOCK_CATEGORIES);

  const { data = localMock, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("property_categories").select("*").order("position");
      if (error || !data?.length) return localMock;
      return data;
    },
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: slugify(name.trim()),
      position: (data?.length ?? 0) + 1,
    };
    const { error } = await supabase.from("property_categories").insert(payload);
    setSaving(false);
    if (error) {
      // Fallback mock local para demo/freela
      setLocalMock((prev) => [
        ...prev,
        { id: `mock-${Date.now()}`, ...payload, created_at: new Date().toISOString() },
      ]);
      toast.message("Salvo em modo mock (API indisponível)");
    } else {
      toast.success("Categoria criada");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    }
    setName("");
  };

  const remove = async (id: string) => {
    if (id.startsWith("mock-") || id.startsWith("mock-cat-")) {
      setLocalMock((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categoria mock removida");
      return;
    }
    const { error } = await supabase.from("property_categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Categoria removida");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Categorias</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tipos de imóvel exibidos nos filtros do portal.</p>
      </div>

      <form onSubmit={add} className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="min-w-[220px] flex-1 space-y-1.5">
          <Label htmlFor="cat-name">Nova categoria</Label>
          <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Studio" />
        </div>
        <Button type="submit" variant="gold" disabled={saving}>{saving ? "Salvando..." : "Adicionar"}</Button>
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="space-y-2">
        {data.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
            <div>
              <p className="font-semibold text-navy">{c.name}</p>
              <p className="text-xs text-muted-foreground">/{c.slug} · posição {c.position}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void remove(c.id)}>Remover</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
