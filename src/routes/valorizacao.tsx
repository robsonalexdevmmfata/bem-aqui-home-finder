import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectValuation } from "@/lib/finance";
import { formatBRL, formatPct } from "@/lib/format";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/valorizacao")({
  head: () => ({ meta: [{ title: `Projeção de valorização — ${SITE.name}` }] }),
  component: ValorizacaoPage,
});

function ValorizacaoPage() {
  const [currentValue, setCurrentValue] = useState(750000);
  const [years, setYears] = useState(10);
  const [conservativeRate, setConservativeRate] = useState(3);
  const [baseRate, setBaseRate] = useState(5);
  const [optimisticRate, setOptimisticRate] = useState(8);
  const [inflationRate, setInflationRate] = useState(4);

  const points = useMemo(
    () => projectValuation({ currentValue, years, conservativeRate, baseRate, optimisticRate, inflationRate }),
    [currentValue, years, conservativeRate, baseRate, optimisticRate, inflationRate],
  );
  const last = points[points.length - 1];

  return (
    <SiteShell>
      <PageHero eyebrow="Ferramentas" title="Projeção de valorização" subtitle="Cenários conservador, base e otimista com comparação à inflação." />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" onSubmit={(e) => e.preventDefault()}>
          {[
            ["Valor atual", currentValue, setCurrentValue],
            ["Anos", years, setYears],
            ["Conservador % a.a.", conservativeRate, setConservativeRate],
            ["Base % a.a.", baseRate, setBaseRate],
            ["Otimista % a.a.", optimisticRate, setOptimisticRate],
            ["Inflação % a.a.", inflationRate, setInflationRate],
          ].map(([label, value, set]) => (
            <div key={String(label)} className="space-y-1.5">
              <Label>{label as string}</Label>
              <Input type="number" value={value as number} onChange={(e) => (set as (n: number) => void)(Number(e.target.value))} />
            </div>
          ))}
        </form>
        <div className="space-y-4">
          {last && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label={`Conservador (${formatPct(conservativeRate, 1)})`} value={formatBRL(last.conservative)} />
              <Stat label={`Base (${formatPct(baseRate, 1)})`} value={formatBRL(last.base)} />
              <Stat label={`Otimista (${formatPct(optimisticRate, 1)})`} value={formatBRL(last.optimistic)} />
              <Stat label="Com inflação" value={formatBRL(last.inflation)} />
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Ano</th>
                  <th className="px-4 py-2">Conservador</th>
                  <th className="px-4 py-2">Base</th>
                  <th className="px-4 py-2">Otimista</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.year} className="border-t">
                    <td className="px-4 py-2">{p.year}</td>
                    <td className="px-4 py-2">{formatBRL(p.conservative)}</td>
                    <td className="px-4 py-2">{formatBRL(p.base)}</td>
                    <td className="px-4 py-2">{formatBRL(p.optimistic)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}
