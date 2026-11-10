const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brl2 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("pt-BR");

export const formatBRL = (v: number | null | undefined, cents = false) =>
  v == null || Number.isNaN(Number(v)) ? "—" : (cents ? brl2 : brl).format(Number(v));
export const formatNumber = (v: number | null | undefined) => (v == null ? "—" : num.format(Number(v)));
export const formatPct = (v: number, digits = 2) => `${v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
export const formatDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const formatDateTime = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const priceLabel = (price: number, purpose: string) =>
  purpose === "aluguel" ? `${formatBRL(price)}/mês` : formatBRL(price);

export const PROPERTY_STATUS: Record<string, { label: string; tone: "muted" | "warning" | "success" | "destructive" | "brand" }> = {
  draft: { label: "Rascunho", tone: "muted" },
  pending: { label: "Aguardando aprovação", tone: "warning" },
  published: { label: "Publicado", tone: "success" },
  rejected: { label: "Recusado", tone: "destructive" },
  archived: { label: "Arquivado", tone: "muted" },
};
export const PROPOSAL_STATUS: Record<string, { label: string; tone: "muted" | "warning" | "success" | "destructive" | "brand" }> = {
  pending: { label: "Aguardando resposta", tone: "warning" },
  countered: { label: "Contraproposta", tone: "brand" },
  accepted: { label: "Acordo fechado", tone: "success" },
  rejected: { label: "Recusada", tone: "destructive" },
  withdrawn: { label: "Retirada", tone: "muted" },
};
export const LEAD_STATUS: Record<string, string> = {
  new: "Novo", contacted: "Contatado", qualified: "Qualificado", converted: "Convertido", lost: "Perdido",
};
export const ACCOUNT_STATUS: Record<string, { label: string; tone: "muted" | "warning" | "success" | "destructive" | "brand" }> = {
  pending: { label: "Em análise", tone: "warning" },
  approved: { label: "Aprovado", tone: "success" },
  rejected: { label: "Recusado", tone: "destructive" },
  suspended: { label: "Suspenso", tone: "muted" },
};
export const ROLE_LABEL: Record<string, string> = { admin: "Administrador", broker: "Corretor", agency: "Imobiliária", client: "Cliente" };
export const PURPOSE_LABEL: Record<string, string> = { venda: "Venda", aluguel: "Aluguel" };

export function slugify(s: string) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function onlyDigits(s: string | null | undefined) {
  return (s ?? "").replace(/\D/g, "");
}
