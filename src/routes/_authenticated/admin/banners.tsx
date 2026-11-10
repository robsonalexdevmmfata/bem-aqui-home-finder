import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_BANNERS, pickMockPhoto } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({ meta: [{ title: `Banners — ${SITE.name}` }] }),
  component: AdminBanners,
});

function AdminBanners() {
  const qc = useQueryClient();
  const [localMock, setLocalMock] = useState(MOCK_BANNERS);
  const [form, setForm] = useState({ title: "", subtitle: "", link_url: "/imoveis", image_url: "" });
  const [saving, setSaving] = useState(false);

  const { data = localMock, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("position");
      if (error || !data?.length) return localMock;
      return data;
    },
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      link_url: form.link_url.trim() || null,
      image_url: form.image_url.trim() || pickMockPhoto(data.length),
      position: data.length + 1,
      active: true,
    };
    const { error } = await supabase.from("banners").insert(payload);
    setSaving(false);
    if (error) {
      setLocalMock((prev) => [
        ...prev,
        { id: `mock-ban-${Date.now()}`, created_at: new Date().toISOString(), ...payload },
      ]);
      toast.message("Banner salvo em modo mock");
    } else {
      toast.success("Banner criado");
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    }
    setForm({ title: "", subtitle: "", link_url: "/imoveis", image_url: "" });
  };

  const toggle = async (id: string, active: boolean) => {
    if (id.startsWith("mock-")) {
      setLocalMock((prev) => prev.map((b) => (b.id === id ? { ...b, active } : b)));
      return;
    }
    const { error } = await supabase.from("banners").update({ active }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  const remove = async (id: string) => {
    if (id.startsWith("mock-")) {
      setLocalMock((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner mock removido");
      return;
    }
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Banner removido");
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Banners</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conteúdo promocional do portal (CMS).</p>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Subtítulo</Label>
            <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Link</Label>
            <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>URL da imagem (opcional — senão usa mock)</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <Button type="submit" variant="gold" disabled={saving}>{saving ? "Salvando..." : "Adicionar banner"}</Button>
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((b) => (
          <article key={b.id} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            {b.image_url && <img src={b.image_url} alt="" className="aspect-[16/7] w-full object-cover" />}
            <div className="space-y-3 p-4">
              <div>
                <p className="font-semibold text-navy">{b.title}</p>
                {b.subtitle && <p className="text-sm text-muted-foreground">{b.subtitle}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{b.link_url}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={b.active} onCheckedChange={(v) => void toggle(b.id, v)} />
                  Ativo
                </label>
                <Button size="sm" variant="outline" onClick={() => void remove(b.id)}>Remover</Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
