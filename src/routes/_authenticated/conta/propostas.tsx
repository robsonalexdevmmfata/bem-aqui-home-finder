import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime, PROPOSAL_STATUS } from "@/lib/format";
import { StatusBadge } from "@/components/site/StatusBadge";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/conta/propostas")({
  head: () => ({ meta: [{ title: `Propostas — ${SITE.name}` }] }),
  component: PropostasPage,
});

function PropostasPage() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["my-proposals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, amount, status, type, created_at, property:properties(id, slug, title)")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Minhas propostas</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && data.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma proposta ainda.
        </div>
      )}
      <div className="space-y-3">
        {data.map((row) => {
          const p = row.property as { slug: string; title: string } | null;
          return (
            <div key={row.id} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {p ? (
                    <Link to="/imovel/$slug" params={{ slug: p.slug }} className="font-semibold text-navy hover:underline">
                      {p.title}
                    </Link>
                  ) : (
                    <p className="font-semibold text-navy">Imóvel</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatBRL(Number(row.amount))} · {row.type} · {formatDateTime(row.created_at)}
                  </p>
                </div>
                <StatusBadge map={PROPOSAL_STATUS} value={row.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
