import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, ClipboardCheck, Users, UserRoundCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";
import { ADMIN_DASHBOARD } from "@/lib/dashboard-metrics";
import {
  ActivityList,
  ChartCard,
  DonutChart,
  KpiCard,
  StatusBarChart,
  TrafficAreaChart,
} from "@/components/site/DashboardCharts";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: `Admin — ${SITE.name}` }] }),
  component: AdminHome,
});

function AdminHome() {
  const mock = ADMIN_DASHBOARD;
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!hasSupabaseEnv()) return null;
      try {
        const [users, pendingProps, published, pendingAccounts] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        const live = {
          users: users.count ?? 0,
          pendingProps: pendingProps.count ?? 0,
          published: published.count ?? 0,
          pendingAccounts: pendingAccounts.count ?? 0,
        };
        const empty = Object.values(live).every((v) => v === 0);
        return empty ? null : live;
      } catch {
        return null;
      }
    },
  });

  const kpis = data ?? mock.kpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Administração</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">Painel operacional</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saúde da plataforma, aprovações e performance comercial em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/admin/usuarios">Usuários</Link></Button>
          <Button asChild variant="gold"><Link to="/admin/imoveis">Ir para aprovações</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Usuários" value={kpis.users} icon={Users} delta="+8,2%" hint="vs. mês anterior" />
        <KpiCard label="Contas pendentes" value={kpis.pendingAccounts} icon={UserRoundCheck} delta="18 em fila" deltaUp={false} hint="revisão necessária" />
        <KpiCard label="Imóveis pendentes" value={kpis.pendingProps} icon={ClipboardCheck} delta="24 aguardando" deltaUp={false} />
        <KpiCard label="Publicados" value={kpis.published} icon={Building2} delta="+12%" hint="catálogo ativo" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Tráfego e leads"
          description="Visitas ao portal e conversão em leads nos últimos 7 meses"
        >
          <TrafficAreaChart data={mock.traffic} />
        </ChartCard>
        <ChartCard title="Usuários por perfil" description="Distribuição da base cadastrada">
          <DonutChart data={mock.usersByRole} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Status do inventário" description="Imóveis por situação cadastral" className="lg:col-span-1">
          <DonutChart data={mock.propertyStatus} />
        </ChartCard>
        <ChartCard title="Imóveis por cidade" description="Concentração geográfica do estoque" className="lg:col-span-1">
          <StatusBarChart
            data={mock.cities.map((c) => ({ name: c.city, value: c.listings }))}
            color="var(--chart-2)"
          />
        </ChartCard>
        <ChartCard title="Fila operacional" description="Últimas movimentações da plataforma">
          <ActivityList items={mock.activity} />
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-surface p-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Leads (30d)</p>
              <p className="font-display text-xl font-bold text-navy">{mock.kpis.leads30d}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversão</p>
              <p className="font-display text-xl font-bold text-navy">{mock.kpis.conversion}</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
