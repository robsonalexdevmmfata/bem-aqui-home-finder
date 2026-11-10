/** Séries e KPIs de demonstração para dashboards profissionais (mock-first). */

export const ADMIN_DASHBOARD = {
  kpis: {
    users: 1284,
    pendingAccounts: 18,
    pendingProps: 24,
    published: 312,
    leads30d: 847,
    conversion: "19,4%",
  },
  traffic: [
    { month: "Mai", visits: 4200, leads: 180 },
    { month: "Jun", visits: 5100, leads: 210 },
    { month: "Jul", visits: 4800, leads: 195 },
    { month: "Ago", visits: 6200, leads: 268 },
    { month: "Set", visits: 7100, leads: 302 },
    { month: "Out", visits: 7800, leads: 341 },
    { month: "Nov", visits: 8600, leads: 389 },
  ],
  propertyStatus: [
    { name: "Publicados", value: 312 },
    { name: "Pendentes", value: 24 },
    { name: "Rascunho", value: 41 },
    { name: "Arquivados", value: 18 },
  ],
  usersByRole: [
    { name: "Clientes", value: 980 },
    { name: "Corretores", value: 214 },
    { name: "Imobiliárias", value: 62 },
    { name: "Admins", value: 28 },
  ],
  cities: [
    { city: "São Paulo", listings: 98 },
    { city: "Campinas", listings: 54 },
    { city: "Santos", listings: 41 },
    { city: "Ribeirão", listings: 36 },
    { city: "Sorocaba", listings: 28 },
  ],
  activity: [
    { time: "Há 12 min", text: "Novo imóvel aguardando aprovação em Campinas" },
    { time: "Há 41 min", text: "Conta profissional de corretor pendente" },
    { time: "Há 2 h", text: "Banner home atualizado" },
    { time: "Há 5 h", text: "28 leads gerados no último dia" },
  ],
} as const;

export const BROKER_DASHBOARD = {
  kpis: {
    total: 18,
    published: 12,
    pending: 3,
    leads: 47,
    proposals: 14,
    openProposals: 6,
    conversion: "29,8%",
    ticket: "R$ 1,18 mi",
  },
  weekly: [
    { week: "Sem 1", leads: 6, proposals: 1, views: 180 },
    { week: "Sem 2", leads: 9, proposals: 2, views: 240 },
    { week: "Sem 3", leads: 7, proposals: 3, views: 210 },
    { week: "Sem 4", leads: 11, proposals: 2, views: 290 },
    { week: "Sem 5", leads: 8, proposals: 3, views: 260 },
    { week: "Sem 6", leads: 14, proposals: 4, views: 340 },
  ],
  funnel: [
    { stage: "Visualizações", value: 1284 },
    { stage: "Leads", value: 47 },
    { stage: "Propostas", value: 14 },
    { stage: "Aceitas", value: 4 },
  ],
  propertyMix: [
    { name: "Publicados", value: 12 },
    { name: "Pendentes", value: 3 },
    { name: "Rascunho", value: 2 },
    { name: "Arquivados", value: 1 },
  ],
  topListings: [
    { title: "Cobertura Jardins", leads: 12, views: 420 },
    { title: "Apto Moema", leads: 9, views: 310 },
    { title: "Casa Alphaville", leads: 7, views: 280 },
    { title: "Studio Pinheiros", leads: 5, views: 190 },
  ],
} as const;

export const CLIENT_DASHBOARD = {
  kpis: {
    favorites: 8,
    proposals: 3,
    openProposals: 2,
    views: 36,
    savedSearches: 4,
  },
  activity: [
    { month: "Jun", views: 4, favorites: 1, proposals: 0 },
    { month: "Jul", views: 7, favorites: 2, proposals: 1 },
    { month: "Ago", views: 5, favorites: 1, proposals: 0 },
    { month: "Set", views: 9, favorites: 3, proposals: 1 },
    { month: "Out", views: 6, favorites: 2, proposals: 0 },
    { month: "Nov", views: 11, favorites: 4, proposals: 1 },
  ],
  interest: [
    { name: "Apartamento", value: 14 },
    { name: "Casa", value: 8 },
    { name: "Cobertura", value: 5 },
    { name: "Studio", value: 4 },
  ],
  budget: [
    { range: "Até 500k", count: 3 },
    { range: "500k–1mi", count: 9 },
    { range: "1–2mi", count: 7 },
    { range: "2mi+", count: 2 },
  ],
  recent: [
    { title: "Apto 3 dorms — Moema", status: "Favorito", price: "R$ 1.150.000" },
    { title: "Casa condomínio — Alphaville", status: "Proposta enviada", price: "R$ 2.450.000" },
    { title: "Studio — Pinheiros", status: "Visitado", price: "R$ 620.000" },
    { title: "Cobertura — Jardins", status: "Em análise", price: "R$ 3.900.000" },
  ],
} as const;
