import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simulateFinancing, type AmortizationSystem } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import { SITE } from "@/lib/config";

const searchSchema = z.object({
  value: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/simulador")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: `Simulador financeiro — ${SITE.name}` }] }),
  component: SimuladorPage,
});

function SimuladorPage() {
  const { value } = Route.useSearch();
  const [propertyValue, setPropertyValue] = useState(Number(value) || 850000);
  const [downPayment, setDownPayment] = useState(170000);
  const [months, setMonths] = useState(360);
  const [annualRate, setAnnualRate] = useState(10.5);
  const [system, setSystem] = useState<AmortizationSystem>("PRICE");

  const result = useMemo(
    () => simulateFinancing({ propertyValue, downPayment, months, annualRate, system }),
    [propertyValue, downPayment, months, annualRate, system],
  );

  return (
    <SiteShell>
      <PageHero eyebrow="Ferramentas" title="Simulador financeiro" subtitle="Compare SAC e PRICE com entrada, prazo e taxa personalizados." />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft" onSubmit={(e) => e.preventDefault()}>
          <Field label="Valor do imóvel">
            <Input type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} />
          </Field>
          <Field label="Entrada">
            <Input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
          </Field>
          <Field label="Prazo (meses)">
            <Input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
          </Field>
          <Field label="Taxa anual (%)">
            <Input type="number" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} />
          </Field>
          <Field label="Sistema">
            <Select value={system} onValueChange={(v) => setSystem(v as AmortizationSystem)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PRICE">PRICE (parcelas fixas)</SelectItem>
                <SelectItem value="SAC">SAC (amortização constante)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </form>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Financiado" value={formatBRL(result.financed)} />
            <Stat label="1ª parcela" value={formatBRL(result.firstPayment, true)} />
            <Stat label="Última parcela" value={formatBRL(result.lastPayment, true)} />
            <Stat label="Total de juros" value={formatBRL(result.totalInterest, true)} />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <div className="border-b bg-surface px-4 py-3 text-sm font-semibold">Primeiras 12 parcelas</div>
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2">Mês</th>
                    <th className="px-4 py-2">Parcela</th>
                    <th className="px-4 py-2">Juros</th>
                    <th className="px-4 py-2">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 12).map((r) => (
                    <tr key={r.month} className="border-t">
                      <td className="px-4 py-2">{r.month}</td>
                      <td className="px-4 py-2">{formatBRL(r.payment, true)}</td>
                      <td className="px-4 py-2">{formatBRL(r.interest, true)}</td>
                      <td className="px-4 py-2">{formatBRL(r.balance, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
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
