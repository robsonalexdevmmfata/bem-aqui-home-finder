import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/imoveis/novo")({
  head: () => ({ meta: [{ title: `Novo imóvel — ${SITE.name}` }] }),
  component: NovoImovelPage,
});

function NovoImovelPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    purpose: "venda",
    price: "500000",
    city: "São Paulo",
    neighborhood: "",
    bedrooms: "2",
    bathrooms: "1",
    parking_spots: "1",
    area_m2: "70",
    submitForApproval: false,
  });

  if (profile?.status !== "approved") {
    return (
      <div className="rounded-2xl border bg-card p-8 shadow-soft">
        <h1 className="font-display text-2xl font-bold text-navy">Conta em análise</h1>
        <p className="mt-2 text-sm text-muted-foreground">Aguarde aprovação administrativa para cadastrar imóveis.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const baseSlug = slugify(form.title) || `imovel-${Date.now()}`;
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        title: form.title.trim(),
        slug,
        description: form.description.trim(),
        purpose: form.purpose as "venda" | "aluguel",
        price: Number(form.price),
        city: form.city.trim() || null,
        neighborhood: form.neighborhood.trim() || null,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        parking_spots: Number(form.parking_spots) || 0,
        area_m2: Number(form.area_m2) || null,
        status: form.submitForApproval ? "pending" : "draft",
      })
      .select("id")
      .single();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.submitForApproval ? "Enviado para aprovação" : "Rascunho salvo");
    await navigate({ to: "/painel/imoveis/$id", params: { id: data.id } });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Novo imóvel</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="space-y-1.5">
          <Label>Título</Label>
          <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Descrição</Label>
          <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Finalidade</Label>
            <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Preço</Label>
            <Input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Bairro</Label>
            <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Quartos</Label>
            <Input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Banheiros</Label>
            <Input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Vagas</Label>
            <Input type="number" value={form.parking_spots} onChange={(e) => setForm({ ...form, parking_spots: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Área (m²)</Label>
            <Input type="number" value={form.area_m2} onChange={(e) => setForm({ ...form, area_m2: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.submitForApproval}
            onChange={(e) => setForm({ ...form, submitForApproval: e.target.checked })}
          />
          Enviar para aprovação agora
        </label>
        <Button type="submit" variant="gold" disabled={loading}>{loading ? "Salvando..." : "Salvar imóvel"}</Button>
      </form>
    </div>
  );
}
