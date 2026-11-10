import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, FileText, Handshake, Target, TrendingUp, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";
import { BROKER_DASHBOARD } from "@/lib/dashboard-metrics";
import {
  ActivityList,
  ChartCard,
  DonutChart,
  DualLineChart,
  KpiCard,
  StatusBarChart,
} from "@/components/site/DashboardCharts";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({ meta: [{ title: `Painel — ${SITE.name}` }] }),
  component: PainelHome,
});

function PainelHome() {
  const { user, profile } = useAuth();
  const mock = BROKER_DASHBOARD;

  const { data } = useQuery({
    queryKey: ["painel-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!hasSupabaseEnv() || !user) return null;
      try {
        const uid = user.id;
        const [props, leads, proposals] = await Promise.all([
          supabase.from("properties").select("id, status", { count: "exact" }).eq("owner_id", uid),
          supabase.from("leads").select("id, status", { count: "exact" }).eq("owner_id", uid),
          supabase.from("proposals").select("id, status", { count: "exact" }).eq("owner_id", uid),
        ]);
        const list = props.data ?? [];
        const live = {
          total: props.count ?? list.length,
          published: list.filter((p) => p.status === "published").length,
          pending: list.filter((p) => p.status === "pending").length,
          leads: leads.count ?? 0,
          proposals: proposals.count ?? 0,
          openProposals: (proposals.data ?? []).filter((p) => p.status === "pending" || p.status === "countered").length,
        };
        const empty = live.total === 0 && live.leads === 0 && live.proposals === 0;
        return empty ? null : live;
      } catch {
        return null;
      }
    },
  });

  const kpis = data
    ? { ...mock.kpis, ...data, conversion: mock.kpis.conversion, ticket: mock.kpis.ticket }
    : mock.kpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Corretor</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">Performance comercial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conta {profile?.status === "approved" ? "aprovada" : "em análise"} — pipeline de imóveis, leads e propostas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/painel/relatorios">Relatórios</Link></Button>
          <Button asChild variant="gold"><Link to="/painel/imoveis">Gerenciar imóveis</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Imóveis" value={kpis.total} icon={Building2} delta="+2 no mês" hint="carteira total" />
        <KpiCard label="Publicados" value={kpis.published} icon={Eye} delta="+15%" hint="ativos no site" />
        <KpiCard label="Aguardando aprovação" value={kpis.pending} icon={FileText} delta="revisão admin" deltaUp={false} />
        <KpiCard label="Leads" value={kpis.leads} icon={Target} delta="+22%" hint="últimos 30 dias" />
        <KpiCard label="Propostas" value={kpis.proposals} icon={Handshake} delta="+4 abertas" />
        <KpiCard label="Ticket médio" value={kpis.ticket} icon={TrendingUp} delta={kpis.conversion} hint="taxa lead→proposta" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Evolução semanal"
          description="Leads, propostas e visualizações das suas listagens"
        >
          <DualLineChart data={mock.weekly} />
        </ChartCard>
        <ChartCard title="Mix da carteira" description="Status dos seus imóveis">
          <DonutChart data={mock.propertyMix} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Funil de conversão" description="Do interesse à proposta aceita">
          <StatusBarChart data={mock.funnel.map((f) => ({ name: f.stage, value: f.value }))} color="var(--chart-1)" />
        </ChartCard>
        <ChartCard
          title="Top listagens"
          description="Imóveis com mais engajamento"
          action={<Button asChild size="sm" variant="outline"><Link to="/painel/leads">Ver leads</Link></Button>}
        >
          <ActivityList
            items={mock.topListings.map((l) => ({
              title: l.title,
              status: `${l.leads} leads · ${l.views} views`,
              price: `${l.leads} leads`,
            }))}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="navy" size="sm"><Link to="/painel/propostas">Negociações</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/painel/imoveis/novo">Novo imóvel</Link></Button>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
