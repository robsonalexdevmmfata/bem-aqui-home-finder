import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeInvestment } from "@/lib/finance";
import { formatBRL, formatPct } from "@/lib/format";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/analise-investimento")({
  head: () => ({ meta: [{ title: `Análise de investimento — ${SITE.name}` }] }),
  component: AnalisePage,
});

function AnalisePage() {
  const [acquisitionValue, setAcquisitionValue] = useState(650000);
  const [additionalCosts, setAdditionalCosts] = useState(25000);
  const [monthlyRent, setMonthlyRent] = useState(4200);
  const [monthlyExpenses, setMonthlyExpenses] = useState(900);
  const [vacancyRate, setVacancyRate] = useState(8);

  const result = useMemo(
    () => analyzeInvestment({ acquisitionValue, additionalCosts, monthlyRent, monthlyExpenses, vacancyRate }),
    [acquisitionValue, additionalCosts, monthlyRent, monthlyExpenses, vacancyRate],
  );

  return (
    <SiteShell>
      <PageHero eyebrow="Ferramentas" title="Análise de investimento" subtitle="Estime rentabilidade líquida, vacância e payback." />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" onSubmit={(e) => e.preventDefault()}>
          {[
            ["Valor de aquisição", acquisitionValue, setAcquisitionValue],
            ["Custos adicionais", additionalCosts, setAdditionalCosts],
            ["Aluguel mensal", monthlyRent, setMonthlyRent],
            ["Despesas mensais", monthlyExpenses, setMonthlyExpenses],
            ["Vacância (%)", vacancyRate, setVacancyRate],
          ].map(([label, value, set]) => (
            <div key={String(label)} className="space-y-1.5">
              <Label>{label as string}</Label>
              <Input type="number" value={value as number} onChange={(e) => (set as (n: number) => void)(Number(e.target.value))} />
            </div>
          ))}
        </form>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Total investido" value={formatBRL(result.totalInvested)} />
          <Stat label="Líquido mensal" value={formatBRL(result.netMonthly, true)} />
          <Stat label="Líquido anual" value={formatBRL(result.netAnnual, true)} />
          <Stat label="Yield bruto" value={formatPct(result.grossYieldPct)} />
          <Stat label="Yield líquido" value={formatPct(result.netYieldPct)} />
          <Stat label="Payback" value={result.paybackYears == null ? "—" : `${result.paybackYears.toFixed(1)} anos`} />
        </div>
      </div>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}
