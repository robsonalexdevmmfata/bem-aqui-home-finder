export type AmortizationSystem = "SAC" | "PRICE";

export interface FinancingInput {
  propertyValue: number;
  downPayment: number;
  months: number;
  /** Annual nominal interest rate in percent, e.g. 10.5 */
  annualRate: number;
  system: AmortizationSystem;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  amortization: number;
  balance: number;
}

export interface FinancingResult {
  financed: number;
  firstPayment: number;
  lastPayment: number;
  totalInterest: number;
  totalPaid: number;
  monthlyRate: number;
  rows: AmortizationRow[];
}

/** Converts an annual effective rate (%) to a monthly effective rate (decimal). */
export function monthlyRateFromAnnual(annualRatePct: number) {
  return Math.pow(1 + annualRatePct / 100, 1 / 12) - 1;
}

export function simulateFinancing(input: FinancingInput): FinancingResult {
  const financed = Math.max(0, input.propertyValue - input.downPayment);
  const n = Math.max(1, Math.round(input.months));
  const i = monthlyRateFromAnnual(input.annualRate);
  const rows: AmortizationRow[] = [];
  let balance = financed;

  if (input.system === "PRICE") {
    const pmt = i === 0 ? financed / n : (financed * i) / (1 - Math.pow(1 + i, -n));
    for (let m = 1; m <= n; m++) {
      const interest = balance * i;
      const amortization = pmt - interest;
      balance = Math.max(0, balance - amortization);
      rows.push({ month: m, payment: pmt, interest, amortization, balance });
    }
  } else {
    const amortization = financed / n;
    for (let m = 1; m <= n; m++) {
      const interest = balance * i;
      balance = Math.max(0, balance - amortization);
      rows.push({ month: m, payment: amortization + interest, interest, amortization, balance });
    }
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  return {
    financed,
    firstPayment: rows[0]?.payment ?? 0,
    lastPayment: rows[rows.length - 1]?.payment ?? 0,
    totalInterest,
    totalPaid: financed + totalInterest + input.downPayment,
    monthlyRate: i,
    rows,
  };
}

export interface ValuationInput {
  currentValue: number;
  years: number;
  conservativeRate: number;
  baseRate: number;
  optimisticRate: number;
  inflationRate?: number;
}

export interface ValuationPoint {
  year: number;
  conservative: number;
  base: number;
  optimistic: number;
  inflation?: number | undefined;
}

export function projectValuation(input: ValuationInput): ValuationPoint[] {
  const pts: ValuationPoint[] = [];
  const years = Math.max(1, Math.round(input.years));
  for (let y = 0; y <= years; y++) {
    pts.push({
      year: y,
      conservative: input.currentValue * Math.pow(1 + input.conservativeRate / 100, y),
      base: input.currentValue * Math.pow(1 + input.baseRate / 100, y),
      optimistic: input.currentValue * Math.pow(1 + input.optimisticRate / 100, y),
      inflation: input.inflationRate != null ? input.currentValue * Math.pow(1 + input.inflationRate / 100, y) : undefined,
    });
  }
  return pts;
}

export interface InvestmentInput {
  acquisitionValue: number;
  additionalCosts: number;
  monthlyRent: number;
  /** Monthly expenses paid by the owner (condo when vacant, maintenance, management fee). */
  monthlyExpenses: number;
  /** Expected vacancy in percent of the year. */
  vacancyRate: number;
}

export interface InvestmentResult {
  totalInvested: number;
  netMonthly: number;
  netAnnual: number;
  grossYieldPct: number;
  netYieldPct: number;
  paybackYears: number | null;
}

export function analyzeInvestment(input: InvestmentInput): InvestmentResult {
  const totalInvested = input.acquisitionValue + input.additionalCosts;
  const effectiveRent = input.monthlyRent * (1 - input.vacancyRate / 100);
  const netMonthly = effectiveRent - input.monthlyExpenses;
  const netAnnual = netMonthly * 12;
  const grossYieldPct = totalInvested > 0 ? ((input.monthlyRent * 12) / totalInvested) * 100 : 0;
  const netYieldPct = totalInvested > 0 ? (netAnnual / totalInvested) * 100 : 0;
  const paybackYears = netAnnual > 0 ? totalInvested / netAnnual : null;
  return { totalInvested, netMonthly, netAnnual, grossYieldPct, netYieldPct, paybackYears };
}
