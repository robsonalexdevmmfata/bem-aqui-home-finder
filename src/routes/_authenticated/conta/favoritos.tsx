import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { priceLabel } from "@/lib/format";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/conta/favoritos")({
  head: () => ({ meta: [{ title: `Favoritos — ${SITE.name}` }] }),
  component: FavoritosPage,
});

function FavoritosPage() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id, created_at, property:properties(id, slug, title, purpose, price, city, neighborhood, status)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Favoritos</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && data.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Você ainda não favoritou imóveis. <Link to="/imoveis" className="font-semibold text-primary hover:underline">Explorar</Link>
        </div>
      )}
      <div className="space-y-3">
        {data.map((f) => {
          const p = f.property as { id: string; slug: string; title: string; purpose: string; price: number; city: string | null; neighborhood: string | null } | null;
          if (!p) return null;
          return (
            <Link key={f.id} to="/imovel/$slug" params={{ slug: p.slug }} className="block rounded-2xl border bg-card p-4 shadow-soft transition hover:shadow-lift">
              <p className="font-semibold text-navy">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {priceLabel(Number(p.price), p.purpose)} · {[p.neighborhood, p.city].filter(Boolean).join(", ")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
