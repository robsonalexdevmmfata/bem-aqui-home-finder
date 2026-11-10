import type { PropertyCardData } from "@/lib/public.functions";

/** Fallbacks usados quando a API/storage ainda não responde (demo / freela). */

export const MOCK_PROPERTY_PHOTOS = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
];

export function pickMockPhoto(seed = 0) {
  return MOCK_PROPERTY_PHOTOS[Math.abs(seed) % MOCK_PROPERTY_PHOTOS.length]!;
}

function card(
  partial: Omit<PropertyCardData, "images" | "is_demo" | "published_at" | "suites" | "category"> & {
    suites?: number;
    category?: PropertyCardData["category"];
    image?: number;
  },
): PropertyCardData {
  return {
    suites: 0,
    category: partial.category ?? { name: "Apartamento", slug: "apartamento" },
    is_demo: true,
    published_at: new Date().toISOString(),
    images: [
      { url: pickMockPhoto(partial.image ?? 0), position: 0 },
      { url: pickMockPhoto((partial.image ?? 0) + 1), position: 1 },
    ],
    ...partial,
  };
}

export const MOCK_PROPERTIES: PropertyCardData[] = [
  card({
    id: "mock-1",
    slug: "cobertura-jardins-vista-cidade",
    title: "Cobertura nos Jardins com vista panorâmica",
    purpose: "venda",
    price: 2850000,
    area_m2: 186,
    bedrooms: 4,
    suites: 2,
    bathrooms: 4,
    parking_spots: 3,
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    featured: true,
    is_investment: false,
    expected_rent: null,
    category: { name: "Cobertura", slug: "cobertura" },
    image: 0,
  }),
  card({
    id: "mock-2",
    slug: "apto-pinheiros-reformado",
    title: "Apartamento reformado em Pinheiros",
    purpose: "venda",
    price: 980000,
    area_m2: 78,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parking_spots: 1,
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    featured: true,
    is_investment: true,
    expected_rent: 5200,
    image: 1,
  }),
  card({
    id: "mock-3",
    slug: "casa-condo-alphaville",
    title: "Casa em condomínio — Alphaville",
    purpose: "venda",
    price: 1650000,
    area_m2: 240,
    bedrooms: 4,
    suites: 3,
    bathrooms: 5,
    parking_spots: 4,
    neighborhood: "Alphaville",
    city: "Barueri",
    state: "SP",
    featured: true,
    is_investment: false,
    expected_rent: null,
    category: { name: "Casa", slug: "casa" },
    image: 2,
  }),
  card({
    id: "mock-4",
    slug: "studio-vila-madalena",
    title: "Studio mobiliado Vila Madalena",
    purpose: "aluguel",
    price: 3800,
    area_m2: 38,
    bedrooms: 1,
    bathrooms: 1,
    parking_spots: 1,
    neighborhood: "Vila Madalena",
    city: "São Paulo",
    state: "SP",
    featured: false,
    is_investment: true,
    expected_rent: 3800,
    image: 3,
  }),
  card({
    id: "mock-5",
    slug: "apto-moema-3-dorms",
    title: "Apartamento 3 dormitórios em Moema",
    purpose: "aluguel",
    price: 7500,
    area_m2: 110,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parking_spots: 2,
    neighborhood: "Moema",
    city: "São Paulo",
    state: "SP",
    featured: true,
    is_investment: false,
    expected_rent: null,
    image: 4,
  }),
  card({
    id: "mock-6",
    slug: "sala-comercial-faria-lima",
    title: "Sala comercial Faria Lima",
    purpose: "venda",
    price: 1250000,
    area_m2: 65,
    bedrooms: 0,
    bathrooms: 2,
    parking_spots: 2,
    neighborhood: "Itaim Bibi",
    city: "São Paulo",
    state: "SP",
    featured: false,
    is_investment: true,
    expected_rent: 9800,
    category: { name: "Comercial", slug: "comercial" },
    image: 5,
  }),
  card({
    id: "mock-7",
    slug: "apto-brooklin-alto",
    title: "Apartamento alto padrão Brooklin",
    purpose: "venda",
    price: 1420000,
    area_m2: 95,
    bedrooms: 3,
    suites: 1,
    bathrooms: 3,
    parking_spots: 2,
    neighborhood: "Brooklin",
    city: "São Paulo",
    state: "SP",
    featured: false,
    is_investment: false,
    expected_rent: null,
    image: 0,
  }),
  card({
    id: "mock-8",
    slug: "casa-sobrado-santana",
    title: "Sobrado familiar em Santana",
    purpose: "aluguel",
    price: 6200,
    area_m2: 160,
    bedrooms: 3,
    bathrooms: 3,
    parking_spots: 2,
    neighborhood: "Santana",
    city: "São Paulo",
    state: "SP",
    featured: false,
    is_investment: false,
    expected_rent: null,
    category: { name: "Casa", slug: "casa" },
    image: 2,
  }),
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

export const MOCK_BROKERS = [
  {
    id: "mock-broker-1",
    display_name: "Ana Horizonte",
    creci: "123456-F",
    bio: "Especialista em imóveis de alto padrão na zona sul.",
    photo_url: null,
    city: "São Paulo",
    specialties: ["Coberturas", "Jardins"],
    is_demo: true,
    whatsapp: null,
    featured: true,
    agency: { name: "Horizonte Imóveis" },
  },
  {
    id: "mock-broker-2",
    display_name: "Carlos Mendes",
    creci: "654321-F",
    bio: "Foco em investimentos e locação corporativa.",
    photo_url: null,
    city: "São Paulo",
    specialties: ["Investimento", "Comercial"],
    is_demo: true,
    whatsapp: null,
    featured: true,
    agency: { name: "Horizonte Imóveis" },
  },
];

export const MOCK_PARTNERS = [
  { id: "mock-p1", name: "Banco Demo Cred", description: "Financiamento facilitado", logo_url: null, website: null, is_demo: true },
  { id: "mock-p2", name: "SeguraLar", description: "Seguros residenciais", logo_url: null, website: null, is_demo: true },
];

export const MOCK_TESTIMONIALS = [
  {
    id: "mock-t1",
    author_name: "Mariana S.",
    author_role: "Compradora",
    content: "Encontrei meu apartamento em menos de duas semanas. Plataforma clara e atendimento rápido.",
    rating: 5,
    is_demo: true,
  },
  {
    id: "mock-t2",
    author_name: "Ricardo P.",
    author_role: "Investidor",
    content: "Os simuladores ajudaram a fechar a análise de rentabilidade com segurança.",
    rating: 5,
    is_demo: true,
  },
  {
    id: "mock-t3",
    author_name: "Juliana M.",
    author_role: "Corretora",
    content: "O painel profissional organiza leads e propostas sem complicação.",
    rating: 5,
    is_demo: true,
  },
];

export const MOCK_REPORT_ROWS = [
  { label: "Visualizações (30 dias)", value: 1284 },
  { label: "Leads recebidos", value: 47 },
  { label: "Propostas abertas", value: 9 },
  { label: "Taxa de conversão lead→proposta", value: "19%" },
  { label: "Imóveis publicados", value: 10 },
  { label: "Ticket médio (venda)", value: "R$ 1,2 mi" },
];

export const MOCK_DEMO_USERS = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    email: "admin@bemaqui.com",
    password: "123456",
    full_name: "Admin Bem Aqui",
    roles: ["admin", "client"],
    account_type: "admin",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    email: "corretor@bemaqui.com",
    password: "123456",
    full_name: "Corretor Demo",
    roles: ["broker", "client"],
    account_type: "broker",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    email: "cliente@bemaqui.com",
    password: "123456",
    full_name: "Cliente Demo",
    roles: ["client"],
    account_type: "client",
  },
] as const;

export function filterMockProperties(filters: {
  purpose?: "venda" | "aluguel";
  city?: string;
  neighborhood?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  q?: string;
  investment?: boolean;
  sort?: "recent" | "price_asc" | "price_desc";
  page?: number;
}) {
  let items = [...MOCK_PROPERTIES];
  if (filters.purpose) items = items.filter((p) => p.purpose === filters.purpose);
  if (filters.investment) items = items.filter((p) => p.is_investment);
  if (filters.city) {
    const c = filters.city.toLowerCase();
    items = items.filter((p) => (p.city ?? "").toLowerCase().includes(c));
  }
  if (filters.neighborhood) {
    const n = filters.neighborhood.toLowerCase();
    items = items.filter((p) => (p.neighborhood ?? "").toLowerCase().includes(n));
  }
  if (filters.category) items = items.filter((p) => p.category?.slug === filters.category);
  if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);
  if (filters.bedrooms) items = items.filter((p) => p.bedrooms >= filters.bedrooms!);
  if (filters.q) {
    const t = filters.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.neighborhood ?? "").toLowerCase().includes(t) ||
        (p.city ?? "").toLowerCase().includes(t),
    );
  }
  if (filters.sort === "price_asc") items.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price_desc") items.sort((a, b) => b.price - a.price);

  const page = filters.page ?? 1;
  const pageSize = 12;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, pageSize };
}

export function getMockHomeData() {
  const sale = MOCK_PROPERTIES.filter((p) => p.purpose === "venda");
  const rent = MOCK_PROPERTIES.filter((p) => p.purpose === "aluguel");
  const invest = MOCK_PROPERTIES.filter((p) => p.is_investment);
  return {
    featured: MOCK_PROPERTIES.filter((p) => p.featured).slice(0, 6),
    recent: MOCK_PROPERTIES.slice(0, 8),
    sale: sale.slice(0, 4),
    rent: rent.slice(0, 4),
    invest: invest.slice(0, 3),
    brokers: MOCK_BROKERS,
    partners: MOCK_PARTNERS,
    testimonials: MOCK_TESTIMONIALS,
    categories: MOCK_CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug })),
  };
}

export function getMockPropertyBySlug(slug: string) {
  const p = MOCK_PROPERTIES.find((x) => x.slug === slug);
  if (!p) return null;
  return {
    ...p,
    description:
      "Imóvel demonstrativo da plataforma BEM AQUI IMÓVEIS. Acabamento premium, boa localização e pronto para visita. Dados fictícios para a proposta comercial.",
    condo_fee: p.purpose === "aluguel" ? 650 : 1200,
    iptu: 350,
    address: `Rua Exemplo, ${100 + Number(p.id.replace(/\D/g, "") || 1)}`,
    zip_code: "01451-000",
    features: [
      { id: "f1", name: "Piscina" },
      { id: "f2", name: "Academia" },
      { id: "f3", name: "Portaria 24h" },
      { id: "f4", name: "Varanda gourmet" },
    ],
    videos: [] as { id: string; url: string; title: string | null }[],
    broker: MOCK_BROKERS[0],
  };
}
