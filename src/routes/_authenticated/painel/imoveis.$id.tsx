import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PROPERTY_STATUS, slugify } from "@/lib/format";
import { StatusBadge } from "@/components/site/StatusBadge";
import { PropertyMediaUploader } from "@/components/site/PropertyMediaUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SITE } from "@/lib/config";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/painel/imoveis/$id")({
  head: () => ({ meta: [{ title: `Editar imóvel — ${SITE.name}` }] }),
  component: EditarImovelPage,
});

type FormState = {
  title: string;
  description: string;
  purpose: string;
  price: string;
  condo_fee: string;
  iptu: string;
  area_m2: string;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parking_spots: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  expected_rent: string;
  category_id: string;
  is_investment: boolean;
  featured: boolean;
  video_url: string;
  featuresText: string;
};

const empty: FormState = {
  title: "",
  description: "",
  purpose: "venda",
  price: "",
  condo_fee: "",
  iptu: "",
  area_m2: "",
  bedrooms: "0",
  suites: "0",
  bathrooms: "0",
  parking_spots: "0",
  address: "",
  neighborhood: "",
  city: "",
  state: "SP",
  zip_code: "",
  expected_rent: "",
  category_id: "",
  is_investment: false,
  featured: false,
  video_url: "",
  featuresText: "",
};

function EditarImovelPage() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  const { data: categories = MOCK_CATEGORIES } = useQuery({
    queryKey: ["categories-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("property_categories").select("*").order("position");
      if (error || !data?.length) return MOCK_CATEGORIES;
      return data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["property-edit", id],
    queryFn: async () => {
      const [{ data: property, error }, { data: features }, { data: videos }] = await Promise.all([
        supabase.from("properties").select("*").eq("id", id).maybeSingle(),
        supabase.from("property_features").select("id, name").eq("property_id", id),
        supabase.from("property_videos").select("id, url, title").eq("property_id", id),
      ]);
      if (error) throw error;
      return { property, features: features ?? [], videos: videos ?? [] };
    },
  });

  useEffect(() => {
    if (!data?.property) return;
    const p = data.property;
    setForm({
      title: p.title ?? "",
      description: p.description ?? "",
      purpose: p.purpose ?? "venda",
      price: String(p.price ?? ""),
      condo_fee: p.condo_fee != null ? String(p.condo_fee) : "",
      iptu: p.iptu != null ? String(p.iptu) : "",
      area_m2: p.area_m2 != null ? String(p.area_m2) : "",
      bedrooms: String(p.bedrooms ?? 0),
      suites: String(p.suites ?? 0),
      bathrooms: String(p.bathrooms ?? 0),
      parking_spots: String(p.parking_spots ?? 0),
      address: p.address ?? "",
      neighborhood: p.neighborhood ?? "",
      city: p.city ?? "",
      state: p.state ?? "SP",
      zip_code: p.zip_code ?? "",
      expected_rent: p.expected_rent != null ? String(p.expected_rent) : "",
      category_id: p.category_id ?? "",
      is_investment: !!p.is_investment,
      featured: !!p.featured,
      video_url: data.videos[0]?.url ?? "",
      featuresText: data.features.map((f) => f.name).join(", "),
    });
  }, [data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((s) => ({ ...s, [key]: value }));

  const save = async (status?: "draft" | "pending") => {
    if (!user || !data?.property) return;
    setSaving(true);
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      purpose: form.purpose,
      price: Number(form.price) || 0,
      condo_fee: form.condo_fee ? Number(form.condo_fee) : null,
      iptu: form.iptu ? Number(form.iptu) : null,
      area_m2: form.area_m2 ? Number(form.area_m2) : null,
      bedrooms: Number(form.bedrooms) || 0,
      suites: Number(form.suites) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking_spots: Number(form.parking_spots) || 0,
      address: form.address.trim() || null,
      neighborhood: form.neighborhood.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      zip_code: form.zip_code.trim() || null,
      expected_rent: form.expected_rent ? Number(form.expected_rent) : null,
      category_id: form.category_id || null,
      is_investment: form.is_investment,
      featured: form.featured,
    };
    if (status) payload.status = status;

    const { error } = await supabase.from("properties").update(payload).eq("id", id).eq("owner_id", user.id);
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    await supabase.from("property_features").delete().eq("property_id", id);
    const features = form.featuresText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (features.length) {
      await supabase.from("property_features").insert(features.map((name) => ({ property_id: id, name })));
    }

    await supabase.from("property_videos").delete().eq("property_id", id);
    if (form.video_url.trim()) {
      await supabase.from("property_videos").insert({
        property_id: id,
        url: form.video_url.trim(),
        title: "Tour / vídeo",
      });
    }

    setSaving(false);
    toast.success("Imóvel atualizado");
    qc.invalidateQueries({ queryKey: ["property-edit", id] });
    qc.invalidateQueries({ queryKey: ["my-properties", user.id] });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!data?.property) {
    return (
      <div className="rounded-2xl border p-8">
        <p>Imóvel não encontrado.</p>
        <Button asChild className="mt-4" variant="outline"><Link to="/painel/imoveis">Voltar</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Editar imóvel</h1>
          <p className="mt-1 text-xs text-muted-foreground">slug: {data.property.slug || slugify(form.title)}</p>
          <div className="mt-2"><StatusBadge map={PROPERTY_STATUS} value={data.property.status} /></div>
        </div>
        <Button asChild variant="outline"><Link to="/painel/imoveis">Voltar</Link></Button>
      </div>

      <form
        className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Finalidade">
            <Select value={form.purpose} onValueChange={(v) => set("purpose", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Descrição">
          <Textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Preço"><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
          <Field label="Condomínio"><Input type="number" value={form.condo_fee} onChange={(e) => set("condo_fee", e.target.value)} /></Field>
          <Field label="IPTU"><Input type="number" value={form.iptu} onChange={(e) => set("iptu", e.target.value)} /></Field>
          <Field label="Área m²"><Input type="number" value={form.area_m2} onChange={(e) => set("area_m2", e.target.value)} /></Field>
          <Field label="Quartos"><Input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></Field>
          <Field label="Suítes"><Input type="number" value={form.suites} onChange={(e) => set("suites", e.target.value)} /></Field>
          <Field label="Banheiros"><Input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} /></Field>
          <Field label="Vagas"><Input type="number" value={form.parking_spots} onChange={(e) => set("parking_spots", e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Endereço"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Bairro"><Input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} /></Field>
          <Field label="Cidade"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="UF"><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
          <Field label="CEP"><Input value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} /></Field>
          <Field label="Categoria">
            <Select value={form.category_id || "none"} onValueChange={(v) => set("category_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aluguel estimado (investimento)">
            <Input type="number" value={form.expected_rent} onChange={(e) => set("expected_rent", e.target.value)} />
          </Field>
          <Field label="URL do vídeo">
            <Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://..." />
          </Field>
        </div>
        <Field label="Características (separadas por vírgula)">
          <Input value={form.featuresText} onChange={(e) => set("featuresText", e.target.value)} placeholder="Piscina, Academia, Varanda" />
        </Field>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.is_investment} onCheckedChange={(v) => set("is_investment", v === true)} />
            Oportunidade de investimento
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.featured} onCheckedChange={(v) => set("featured", v === true)} />
            Destacar no portal
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="navy" disabled={saving}>Salvar</Button>
          {profile?.status === "approved" && data.property.status !== "published" && (
            <Button type="button" variant="gold" disabled={saving} onClick={() => save("pending")}>
              Enviar para aprovação
            </Button>
          )}
        </div>
      </form>

      <PropertyMediaUploader propertyId={id} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
