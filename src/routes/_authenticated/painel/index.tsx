import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PanelStat } from "@/components/site/PanelShell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({ meta: [{ title: `Painel — ${SITE.name}` }] }),
  component: PainelHome,
});

function PainelHome() {
  const { user, profile } = useAuth();
  const { data } = useQuery({
    queryKey: ["painel-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [props, leads, proposals] = await Promise.all([
        supabase.from("properties").select("id, status", { count: "exact" }).eq("owner_id", uid),
        supabase.from("leads").select("id, status", { count: "exact" }).eq("owner_id", uid),
        supabase.from("proposals").select("id, status", { count: "exact" }).eq("owner_id", uid),
      ]);
      const list = props.data ?? [];
      return {
        total: props.count ?? list.length,
        published: list.filter((p) => p.status === "published").length,
        pending: list.filter((p) => p.status === "pending").length,
        leads: leads.count ?? 0,
        proposals: proposals.count ?? 0,
        openProposals: (proposals.data ?? []).filter((p) => p.status === "pending" || p.status === "countered").length,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conta {profile?.status === "approved" ? "aprovada" : "em análise"} — acompanhe imóveis, leads e propostas.
          </p>
        </div>
        <Button asChild variant="gold"><Link to="/painel/imoveis">Gerenciar imóveis</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PanelStat label="Imóveis" value={data?.total ?? "—"} />
        <PanelStat label="Publicados" value={data?.published ?? "—"} />
        <PanelStat label="Aguardando aprovação" value={data?.pending ?? "—"} />
        <PanelStat label="Leads" value={data?.leads ?? "—"} />
        <PanelStat label="Propostas" value={data?.proposals ?? "—"} />
        <PanelStat label="Negociações abertas" value={data?.openProposals ?? "—"} />
      </div>
    </div>
  );
}
