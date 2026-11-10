import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Eye, FileText, Heart, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ACCOUNT_STATUS, ROLE_LABEL } from "@/lib/format";
import { StatusBadge } from "@/components/site/StatusBadge";
import {
  ActivityList,
  ChartCard,
  ClientActivityChart,
  DonutChart,
  KpiCard,
  StatusBarChart,
} from "@/components/site/DashboardCharts";
import { CLIENT_DASHBOARD } from "@/lib/dashboard-metrics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/conta/")({
  head: () => ({ meta: [{ title: `Minha conta — ${SITE.name}` }] }),
  component: ContaHome,
});

function ContaHome() {
  const { profile, user, roles, isAdmin, isPro, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [saving, setSaving] = useState(false);
  const mock = CLIENT_DASHBOARD;

  const mainRole = isAdmin ? "admin" : roles.includes("agency") ? "agency" : roles.includes("broker") ? "broker" : "client";

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    if (!hasSupabaseEnv()) {
      setSaving(false);
      toast.success("Perfil atualizado (modo demonstração)");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null, city: city.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Minha conta</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy">Olá, {profile?.full_name || "cliente"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe favoritos, propostas e o seu interesse imobiliário.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/imoveis">Buscar imóveis</Link></Button>
          <Button asChild variant="gold"><Link to="/conta/favoritos">Meus favoritos</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Favoritos" value={mock.kpis.favorites} icon={Heart} delta="+2 na semana" hint="salvos" />
        <KpiCard label="Propostas" value={mock.kpis.proposals} icon={FileText} delta={`${mock.kpis.openProposals} abertas`} />
        <KpiCard label="Imóveis vistos" value={mock.kpis.views} icon={Eye} delta="+11 este mês" />
        <KpiCard label="Buscas salvas" value={mock.kpis.savedSearches} icon={Search} hint="alertas ativos" />
      </div>

      <div className="grid gap-4 rounded-2xl border bg-card p-5 shadow-soft sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de conta</p>
          <p className="mt-2 font-display text-xl font-bold text-navy">{ROLE_LABEL[mainRole]}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
          <div className="mt-2">
            <StatusBadge map={ACCOUNT_STATUS} value={profile?.status ?? "pending"} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</p>
          <p className="mt-2 truncate text-sm font-semibold text-navy">{profile?.email || user?.email || "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Sua atividade"
          description="Visualizações, favoritos e propostas ao longo dos meses"
        >
          <ClientActivityChart data={mock.activity} />
        </ChartCard>
        <ChartCard title="Interesse por tipo" description="Baseado nas suas navegações">
          <DonutChart data={mock.interest} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Faixa de investimento" description="Distribuição do seu interesse por preço">
          <StatusBarChart
            data={mock.budget.map((b) => ({ name: b.range, value: b.count }))}
            color="var(--chart-2)"
          />
        </ChartCard>
        <ChartCard
          title="Recentes"
          description="Últimos imóveis que você acompanhou"
          action={<Button asChild size="sm" variant="outline"><Link to="/conta/propostas">Propostas</Link></Button>}
        >
          <ActivityList items={mock.recent} />
        </ChartCard>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div>
          <h2 className="font-semibold text-navy">Dados pessoais</h2>
          <p className="text-xs text-muted-foreground">Atualize seu contato para receber leads e propostas.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nome</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="gold" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          {isPro && <Button asChild variant="navy"><Link to="/painel">Painel profissional</Link></Button>}
          {isAdmin && <Button asChild variant="outline"><Link to="/admin">Admin</Link></Button>}
          <Button type="button" variant="outline" onClick={() => signOut()}>Sair</Button>
        </div>
      </form>
    </div>
  );
}
