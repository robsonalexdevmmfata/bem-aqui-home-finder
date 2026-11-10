import { describe, expect, it } from "vitest";
import { analyzeInvestment, projectValuation, simulateFinancing } from "./finance";

describe("simulateFinancing", () => {
  it("financed amount is property value minus down payment", () => {
    const r = simulateFinancing({ propertyValue: 500000, downPayment: 100000, months: 360, annualRate: 10, system: "PRICE" });
    expect(r.financed).toBe(400000);
  });

  it("PRICE has constant installments", () => {
    const r = simulateFinancing({ propertyValue: 500000, downPayment: 100000, months: 120, annualRate: 12, system: "PRICE" });
    expect(r.rows[0]!.payment).toBeCloseTo(r.rows[119]!.payment, 6);
    expect(r.rows[119]!.balance).toBeCloseTo(0, 2);
  });

  it("SAC has constant amortization and decreasing installments", () => {
    const r = simulateFinancing({ propertyValue: 300000, downPayment: 60000, months: 240, annualRate: 9, system: "SAC" });
    expect(r.rows[0]!.amortization).toBeCloseTo(1000, 6);
    expect(r.rows[239]!.amortization).toBeCloseTo(1000, 6);
    expect(r.firstPayment).toBeGreaterThan(r.lastPayment);
  });

  it("SAC pays less total interest than PRICE for same inputs", () => {
    const base = { propertyValue: 500000, downPayment: 100000, months: 360, annualRate: 10 } as const;
    const sac = simulateFinancing({ ...base, system: "SAC" });
    const price = simulateFinancing({ ...base, system: "PRICE" });
    expect(sac.totalInterest).toBeLessThan(price.totalInterest);
  });
});

describe("projectValuation", () => {
  it("compounds annual rate per scenario", () => {
    const pts = projectValuation({ currentValue: 100000, years: 2, conservativeRate: 2, baseRate: 5, optimisticRate: 10 });
    expect(pts).toHaveLength(3);
    expect(pts[2]!.base).toBeCloseTo(110250, 4);
    expect(pts[2]!.optimistic).toBeCloseTo(121000, 4);
  });
});

describe("analyzeInvestment", () => {
  it("computes net yield and payback", () => {
    const r = analyzeInvestment({ acquisitionValue: 400000, additionalCosts: 20000, monthlyRent: 2500, monthlyExpenses: 250, vacancyRate: 0 });
    expect(r.totalInvested).toBe(420000);
    expect(r.netAnnual).toBe(27000);
    expect(r.netYieldPct).toBeCloseTo(6.4286, 3);
    expect(r.paybackYears).toBeCloseTo(15.5556, 3);
  });
});
