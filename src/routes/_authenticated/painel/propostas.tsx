import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDateTime, PROPOSAL_STATUS } from "@/lib/format";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/propostas")({
  head: () => ({ meta: [{ title: `Propostas — ${SITE.name}` }] }),
  component: PainelPropostas,
});

function PainelPropostas() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["painel-proposals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, amount, status, type, created_at, client_name, property:properties(title)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: "accepted" | "rejected") => {
    const { error } = await supabase.from("proposals").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "accepted" ? "Proposta aceita" : "Proposta recusada");
      qc.invalidateQueries({ queryKey: ["painel-proposals", user?.id] });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Propostas recebidas</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="space-y-3">
        {data.map((row) => (
          <article key={row.id} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{(row.property as { title?: string } | null)?.title ?? "Imóvel"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.client_name || "Cliente"} · {formatBRL(Number(row.amount))} · {row.type} · {formatDateTime(row.created_at)}
                </p>
              </div>
              <StatusBadge map={PROPOSAL_STATUS} value={row.status} />
            </div>
            {(row.status === "pending" || row.status === "countered") && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="gold" onClick={() => setStatus(row.id, "accepted")}>Aceitar</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "rejected")}>Recusar</Button>
              </div>
            )}
          </article>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma proposta.</div>
        )}
      </div>
    </div>
  );
}
