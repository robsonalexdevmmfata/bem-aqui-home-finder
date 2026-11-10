import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bath, BedDouble, Car, Heart, MapPin, Maximize2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { DemoBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getPropertyBySlug } from "@/lib/public.functions";
import { formatBRL, priceLabel, PURPOSE_LABEL } from "@/lib/format";
import { integrations, SITE, whatsappLink } from "@/lib/config";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/imovel/$slug")({
  loader: async ({ params }) => {
    const property = await getPropertyBySlug({ data: { slug: params.slug } });
    if (!property) throw notFound();
    return property;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — ${SITE.name}` : SITE.name },
      { name: "description", content: loaderData?.description?.slice(0, 160) ?? SITE.slogan },
    ],
  }),
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const p = Route.useLoaderData();
  const { user } = useAuth();
  const images = useMemo(() => [...(p.images ?? [])].sort((a, b) => a.position - b.position), [p.images]);
  const [active, setActive] = useState(0);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", message: "Tenho interesse neste imóvel." });
  const [sending, setSending] = useState(false);

  const cover = images[active]?.url ?? images[0]?.url;
  const place = [p.neighborhood, p.city, p.state].filter(Boolean).join(", ");
  const broker = p.broker as {
    display_name?: string;
    creci?: string;
    whatsapp?: string | null;
    public_email?: string | null;
    photo_url?: string | null;
    city?: string | null;
    agency?: { name?: string } | null;
  } | null;

  const wa =
    whatsappLink(
      broker?.whatsapp || integrations.whatsappNumber,
      `Olá! Tenho interesse no imóvel ${p.title} (slug: ${p.slug}).`,
    ) ?? "/contato";

  const toggleFavorite = async () => {
    if (!user) {
      toast.message("Faça login para favoritar");
      return;
    }
    const { data: existing } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", p.id).maybeSingle();
    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      toast.success("Removido dos favoritos");
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, property_id: p.id });
      if (error) toast.error(error.message);
      else toast.success("Salvo nos favoritos");
    }
  };

  const sendLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("leads").insert({
      property_id: p.id,
      user_id: user?.id ?? null,
      name: lead.name.trim(),
      email: lead.email.trim(),
      phone: lead.phone.trim(),
      message: lead.message.trim(),
      source: "property_page",
      consent: true,
    });
    setSending(false);
    if (error) {
      toast.error(error.message || "Não foi possível enviar");
      return;
    }
    toast.success("Interesse enviado! O corretor entrará em contato.");
    setLead((s) => ({ ...s, message: "Tenho interesse neste imóvel." }));
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: p.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <SiteShell>
      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border bg-muted shadow-soft">
              {cover ? (
                <img src={cover} alt={p.title} className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-muted-foreground">Sem fotos</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? "border-gold" : "border-transparent"}`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">{PURPOSE_LABEL[p.purpose] ?? p.purpose}</Badge>
                {p.category && <Badge variant="brand">{(p.category as { name: string }).name}</Badge>}
                {p.is_demo && <DemoBadge />}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-navy">{p.title}</h1>
              <p className="mt-2 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold" /> {place || "Localização sob consulta"}
              </p>
              <p className="mt-4 font-display text-3xl font-bold text-navy">{priceLabel(Number(p.price), p.purpose)}</p>
              {(p.condo_fee || p.iptu) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.condo_fee ? `Condomínio ${formatBRL(Number(p.condo_fee))}` : ""}
                  {p.condo_fee && p.iptu ? " · " : ""}
                  {p.iptu ? `IPTU ${formatBRL(Number(p.iptu))}` : ""}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Spec icon={BedDouble} label="Quartos" value={p.bedrooms} />
                <Spec icon={Bath} label="Banheiros" value={p.bathrooms} />
                <Spec icon={Car} label="Vagas" value={p.parking_spots} />
                <Spec icon={Maximize2} label="Área" value={p.area_m2 != null ? `${p.area_m2} m²` : "—"} />
              </div>

              <div className="mt-8">
                <h2 className="font-display text-xl font-bold text-navy">Descrição</h2>
                <div className="gold-rule mt-2" />
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{p.description || "Sem descrição."}</p>
              </div>

              {Array.isArray(p.features) && p.features.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-bold text-navy">Características</h2>
                  <div className="gold-rule mt-2" />
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {(p.features as { id: string; name: string }[]).map((f) => (
                      <li key={f.id} className="rounded-lg border bg-surface px-3 py-2 text-sm">
                        {f.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(p.videos) && p.videos.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-bold text-navy">Vídeos</h2>
                  <div className="gold-rule mt-2" />
                  <ul className="mt-4 space-y-2">
                    {(p.videos as { id: string; url: string; title: string | null }[]).map((v) => (
                      <li key={v.id}>
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                          {v.title || "Assistir vídeo"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={toggleFavorite}>
                  <Heart /> Favoritar
                </Button>
                <Button variant="outline" size="icon" onClick={share} aria-label="Compartilhar">
                  <Share2 />
                </Button>
              </div>
              {typeof wa === "string" && wa.startsWith("http") ? (
                <Button asChild variant="whatsapp" className="mt-3 w-full" size="lg">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle /> WhatsApp
                  </a>
                </Button>
              ) : (
                <Button asChild variant="whatsapp" className="mt-3 w-full" size="lg">
                  <Link to="/contato">
                    <MessageCircle /> Falar com atendimento
                  </Link>
                </Button>
              )}
              <Button asChild variant="gold" className="mt-2 w-full">
                <Link to="/simulador" search={{ value: String(p.price) }}>
                  Simular financiamento
                </Link>
              </Button>
            </div>

            {broker && (
              <div className="rounded-2xl border bg-card p-5 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Corretor responsável</p>
                <p className="mt-2 font-semibold text-navy">{broker.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  CRECI {broker.creci ?? "—"}
                  {broker.agency?.name ? ` · ${broker.agency.name}` : ""}
                </p>
              </div>
            )}

            <form onSubmit={sendLead} className="rounded-2xl border bg-card p-5 shadow-soft space-y-3">
              <p className="font-semibold text-navy">Tenho interesse</p>
              <div className="space-y-1.5">
                <Label htmlFor="lead-name">Nome</Label>
                <Input id="lead-name" required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-email">E-mail</Label>
                <Input id="lead-email" type="email" required value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-phone">Telefone</Label>
                <Input id="lead-phone" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-msg">Mensagem</Label>
                <Textarea id="lead-msg" rows={3} value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} />
              </div>
              <Button type="submit" variant="navy" className="w-full" disabled={sending}>
                {sending ? "Enviando..." : "Enviar interesse"}
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

function Spec({ icon: Icon, label, value }: { icon: typeof BedDouble; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-surface p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-gold" />
      <p className="mt-1 text-sm font-bold text-navy">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
