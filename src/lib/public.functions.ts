import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { hasSupabaseEnv, getSupabasePublicEnv } from "@/lib/env";
import {
  filterMockProperties,
  getMockHomeData,
  getMockPropertyBySlug,
  MOCK_BROKERS,
  MOCK_CATEGORIES,
} from "@/lib/mock-data";
import { withResolvedImages } from "@/lib/property-images";

function mapCards(rows: PropertyCardData[]) {
  return rows.map((p, i) => withResolvedImages(p, i));
}

function publicClient() {
  const { url, key } = getSupabasePublicEnv();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const CARD_SELECT =
  "id, slug, title, purpose, price, area_m2, bedrooms, suites, bathrooms, parking_spots, neighborhood, city, state, featured, is_investment, expected_rent, is_demo, published_at, category:property_categories(name, slug), images:property_images(url, position)";

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  purpose: "venda" | "aluguel";
  price: number;
  area_m2: number | null;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spots: number;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  featured: boolean;
  is_investment: boolean;
  expected_rent: number | null;
  is_demo: boolean;
  published_at: string | null;
  category: { name: string; slug: string } | null;
  images: { url: string; position: number }[];
};

const filtersSchema = z.object({
  purpose: z.enum(["venda", "aluguel"]).optional(),
  city: z.string().max(80).optional(),
  neighborhood: z.string().max(80).optional(),
  category: z.string().max(60).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  bedrooms: z.number().int().min(0).max(10).optional(),
  q: z.string().max(120).optional(),
  investment: z.boolean().optional(),
  sort: z.enum(["recent", "price_asc", "price_desc"]).optional(),
  page: z.number().int().min(1).max(500).optional(),
});
export type PropertyFilters = z.infer<typeof filtersSchema>;
const PAGE_SIZE = 12;

const clean = (s: string) => s.replace(/[%,()]/g, " ").trim();

export const listProperties = createServerFn({ method: "GET" })
  .inputValidator((input: PropertyFilters) => filtersSchema.parse(input))
  .handler(async ({ data }) => {
    if (!hasSupabaseEnv()) return filterMockProperties(data);

    try {
      const sb = publicClient();
      if (!sb) return filterMockProperties(data);

      let categoryId: string | undefined;
      if (data.category) {
        const { data: cat } = await sb.from("property_categories").select("id").eq("slug", data.category).maybeSingle();
        if (!cat) return { items: [] as PropertyCardData[], total: 0, pageSize: PAGE_SIZE };
        categoryId = cat.id;
      }
      const page = data.page ?? 1;
      let q = sb.from("properties").select(CARD_SELECT, { count: "exact" }).eq("status", "published");
      if (data.purpose) q = q.eq("purpose", data.purpose);
      if (data.city) q = q.ilike("city", `%${clean(data.city)}%`);
      if (data.neighborhood) q = q.ilike("neighborhood", `%${clean(data.neighborhood)}%`);
      if (categoryId) q = q.eq("category_id", categoryId);
      if (data.minPrice != null) q = q.gte("price", data.minPrice);
      if (data.maxPrice != null) q = q.lte("price", data.maxPrice);
      if (data.bedrooms) q = q.gte("bedrooms", data.bedrooms);
      if (data.investment) q = q.eq("is_investment", true);
      if (data.q) {
        const t = clean(data.q);
        if (t) q = q.or(`title.ilike.%${t}%,neighborhood.ilike.%${t}%,city.ilike.%${t}%`);
      }
      if (data.sort === "price_asc") q = q.order("price", { ascending: true });
      else if (data.sort === "price_desc") q = q.order("price", { ascending: false });
      else q = q.order("published_at", { ascending: false, nullsFirst: false });
      q = q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      const { data: rows, count, error } = await q;
      if (error) return filterMockProperties(data);
      return {
        items: mapCards((rows ?? []) as unknown as PropertyCardData[]),
        total: count ?? 0,
        pageSize: PAGE_SIZE,
      };
    } catch {
      return filterMockProperties(data);
    }
  });

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  if (!hasSupabaseEnv()) return getMockHomeData();

  try {
    const sb = publicClient();
    if (!sb) return getMockHomeData();
    const base = () => sb.from("properties").select(CARD_SELECT).eq("status", "published");
    const [featured, recent, sale, rent, invest, brokers, partners, testimonials, categories] = await Promise.all([
      base().eq("featured", true).order("published_at", { ascending: false }).limit(6),
      base().order("published_at", { ascending: false }).limit(8),
      base().eq("purpose", "venda").order("price", { ascending: false }).limit(4),
      base().eq("purpose", "aluguel").order("published_at", { ascending: false }).limit(4),
      base().eq("is_investment", true).order("published_at", { ascending: false }).limit(3),
      sb.from("brokers").select("id, display_name, creci, bio, photo_url, city, specialties, is_demo, whatsapp").eq("status", "approved").eq("featured", true).limit(4),
      sb.from("partners").select("id, name, description, logo_url, website, is_demo").eq("active", true).order("position"),
      sb.from("testimonials").select("id, author_name, author_role, content, rating, is_demo").eq("active", true).limit(6),
      sb.from("property_categories").select("id, name, slug").order("position"),
    ]);
    const home = {
      featured: mapCards((featured.data ?? []) as unknown as PropertyCardData[]),
      recent: mapCards((recent.data ?? []) as unknown as PropertyCardData[]),
      sale: mapCards((sale.data ?? []) as unknown as PropertyCardData[]),
      rent: mapCards((rent.data ?? []) as unknown as PropertyCardData[]),
      invest: mapCards((invest.data ?? []) as unknown as PropertyCardData[]),
      // Demo comercial: sempre 12 corretores + depoimentos com foto Unsplash.
      brokers: MOCK_BROKERS,
      partners: partners.data ?? [],
      testimonials: getMockHomeData().testimonials,
      categories: categories.data ?? [],
    };
    if (!home.featured.length && !home.recent.length) return getMockHomeData();
    return { ...home, brokers: MOCK_BROKERS, testimonials: getMockHomeData().testimonials };

  } catch {
    return getMockHomeData();
  }
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  if (!hasSupabaseEnv()) return MOCK_CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug }));
  try {
    const sb = publicClient();
    if (!sb) return MOCK_CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug }));
    const { data } = await sb.from("property_categories").select("id, name, slug").order("position");
    return data?.length ? data : MOCK_CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug }));
  } catch {
    return MOCK_CATEGORIES.map(({ id, name, slug }) => ({ id, name, slug }));
  }
});

export const getPropertyBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    if (!hasSupabaseEnv()) return getMockPropertyBySlug(data.slug);

    try {
      const sb = publicClient();
      if (!sb) return getMockPropertyBySlug(data.slug);
      const { data: p, error } = await sb
        .from("properties")
        .select(
          "*, category:property_categories(name, slug), images:property_images(id, url, position), videos:property_videos(id, url, title), features:property_features(id, name), broker:brokers(id, display_name, creci, bio, whatsapp, public_email, photo_url, city, is_demo, agency:agencies(name))",
        )
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      if (error || !p) return getMockPropertyBySlug(data.slug);
      return withResolvedImages(p as { id: string; images?: { url: string; position: number }[] });
    } catch {
      return getMockPropertyBySlug(data.slug);
    }
  });

export const listBrokers = createServerFn({ method: "GET" }).handler(async () => {
  // Sempre a equipe demo com 12 fotos — suficiente para a proposta/freela.
  return MOCK_BROKERS;
});
