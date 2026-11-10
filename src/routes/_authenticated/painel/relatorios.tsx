import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PanelStat } from "@/components/site/PanelShell";
import { MOCK_REPORT_ROWS } from "@/lib/mock-data";
import { downloadJson, printReport } from "@/lib/property-media";
import { formatDateTime } from "@/lib/format";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/relatorios")({
  head: () => ({ meta: [{ title: `Relatórios — ${SITE.name}` }] }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { user, profile } = useAuth();
  const { data } = useQuery({
    queryKey: ["painel-report", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [props, leads, proposals] = await Promise.all([
        supabase.from("properties").select("id, status, title, price, purpose", { count: "exact" }).eq("owner_id", uid),
        supabase.from("leads").select("id, status", { count: "exact" }).eq("owner_id", uid),
        supabase.from("proposals").select("id, status, amount", { count: "exact" }).eq("owner_id", uid),
      ]);
      return {
        properties: props.data ?? [],
        propertyCount: props.count ?? 0,
        leads: leads.count ?? 0,
        proposals: proposals.count ?? 0,
        openProposals: (proposals.data ?? []).filter((p) => p.status === "pending" || p.status === "countered").length,
      };
    },
  });

  const rows = useMemo(() => {
    if (!data || data.propertyCount === 0) return MOCK_REPORT_ROWS;
    return [
      { label: "Imóveis cadastrados", value: data.propertyCount },
      { label: "Publicados", value: data.properties.filter((p) => p.status === "published").length },
      { label: "Leads", value: data.leads },
      { label: "Propostas", value: data.proposals },
      { label: "Negociações abertas", value: data.openProposals },
      {
        label: "Conversão lead→proposta",
        value: data.leads ? `${Math.round((data.proposals / data.leads) * 100)}%` : "0%",
      },
    ];
  }, [data]);

  const exportPdfLike = () => printReport(`Relatório comercial — ${SITE.name}`);
  const exportJson = () =>
    downloadJson(`relatorio-bem-aqui-${Date.now()}.json`, {
      generatedAt: new Date().toISOString(),
      broker: profile?.full_name,
      email: profile?.email,
      metrics: rows,
      note: data?.propertyCount ? "Dados do painel" : "Métricas mockadas para demonstração",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 no-print">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Relatórios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance comercial · gerado em {formatDateTime(new Date().toISOString())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportJson}><Download /> Exportar JSON</Button>
          <Button variant="gold" onClick={exportPdfLike}><Printer /> Imprimir / PDF</Button>
        </div>
      </div>

      <div className="print-area space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="border-b pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{SITE.name}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-navy">Relatório de desempenho</h2>
          <p className="text-sm text-muted-foreground">{profile?.full_name || "Corretor"} · {profile?.email}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <PanelStat key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
        {!data?.propertyCount && (
          <p className="rounded-xl bg-accent/50 px-4 py-3 text-xs text-muted-foreground">
            Sem dados suficientes no banco — exibindo métricas mockadas para a proposta/demo.
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Use “Imprimir / PDF” do navegador para salvar em PDF. Documento gerado automaticamente pela plataforma.
        </p>
      </div>
    </div>
  );
}
