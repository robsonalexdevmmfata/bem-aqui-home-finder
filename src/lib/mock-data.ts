/** Fallbacks usados quando a API/storage ainda não responde (demo / freela). */

export const MOCK_PROPERTY_PHOTOS = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
];

export const MOCK_BANNERS = [
  {
    id: "mock-ban-1",
    title: "Seu próximo endereço começa aqui",
    subtitle: "Imóveis selecionados em São Paulo e região",
    link_url: "/imoveis",
    image_url: MOCK_PROPERTY_PHOTOS[0],
    position: 1,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-ban-2",
    title: "Oportunidades de investimento",
    subtitle: "Simule rentabilidade e valorização",
    link_url: "/investir",
    image_url: MOCK_PROPERTY_PHOTOS[1],
    position: 2,
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_CATEGORIES = [
  { id: "mock-cat-1", name: "Apartamento", slug: "apartamento", position: 1, created_at: new Date().toISOString() },
  { id: "mock-cat-2", name: "Casa", slug: "casa", position: 2, created_at: new Date().toISOString() },
  { id: "mock-cat-3", name: "Cobertura", slug: "cobertura", position: 3, created_at: new Date().toISOString() },
  { id: "mock-cat-4", name: "Comercial", slug: "comercial", position: 4, created_at: new Date().toISOString() },
  { id: "mock-cat-5", name: "Terreno", slug: "terreno", position: 5, created_at: new Date().toISOString() },
];

export const MOCK_REPORT_ROWS = [
  { label: "Visualizações (30 dias)", value: 1284 },
  { label: "Leads recebidos", value: 47 },
  { label: "Propostas abertas", value: 9 },
  { label: "Taxa de conversão lead→proposta", value: "19%" },
  { label: "Imóveis publicados", value: 10 },
  { label: "Ticket médio (venda)", value: "R$ 1,2 mi" },
];

export function pickMockPhoto(seed = 0) {
  return MOCK_PROPERTY_PHOTOS[Math.abs(seed) % MOCK_PROPERTY_PHOTOS.length];
}
