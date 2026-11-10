import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, PROPERTY_STATUS, PURPOSE_LABEL } from "@/lib/format";
import { StatusBadge, DemoBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/imoveis")({
  head: () => ({ meta: [{ title: `Meus imóveis — ${SITE.name}` }] }),
  component: PainelImoveis,
});

function PainelImoveis() {
  const { user, profile } = useAuth();
  const approved = profile?.status === "approved";
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-properties", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, slug, title, purpose, price, status, city, neighborhood, is_demo, updated_at")
        .eq("owner_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Meus imóveis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {approved ? "Gerencie rascunhos, pendentes e publicados." : "Sua conta precisa estar aprovada para enviar imóveis à publicação."}
          </p>
        </div>
        {approved ? (
          <Button asChild variant="gold">
            <Link to="/painel/imoveis/novo">Novo imóvel</Link>
          </Button>
        ) : (
          <Button variant="gold" disabled>Novo imóvel</Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="space-y-3">
        {data.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{p.title}</p>
                  {p.is_demo && <DemoBadge />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {PURPOSE_LABEL[p.purpose]} · {formatBRL(Number(p.price))} · {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                </p>
              </div>
              <StatusBadge map={PROPERTY_STATUS} value={p.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.status === "published" && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/imovel/$slug" params={{ slug: p.slug }}>Ver no site</Link>
                </Button>
              )}
              <Button asChild size="sm" variant="navy">
                <Link to="/painel/imoveis/$id" params={{ id: p.id }}>Editar</Link>
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Nenhum imóvel cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
