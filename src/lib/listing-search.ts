import { z } from "zod";
import type { PropertyFilters } from "@/lib/public.functions";

export const listingSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  neighborhood: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  purpose: z.enum(["venda", "aluguel"]).optional().catch(undefined),
  minPrice: z.coerce.number().optional().catch(undefined),
  maxPrice: z.coerce.number().optional().catch(undefined),
  bedrooms: z.coerce.number().optional().catch(undefined),
  investment: z
    .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
    .optional()
    .catch(undefined)
    .transform((v) => (v === true || v === "true" || v === "1" ? true : v === false || v === "false" || v === "0" ? false : undefined)),
  sort: z.enum(["recent", "price_asc", "price_desc"]).optional().catch(undefined),
  page: z.coerce.number().optional().catch(undefined),
});

export type ListingSearch = z.infer<typeof listingSearchSchema>;

export function toPropertyFilters(search: ListingSearch, forced?: Partial<PropertyFilters>): PropertyFilters {
  return {
    q: search.q,
    city: search.city,
    neighborhood: search.neighborhood,
    category: search.category,
    purpose: forced?.purpose ?? search.purpose,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    bedrooms: search.bedrooms,
    investment: forced?.investment ?? search.investment,
    sort: search.sort,
    page: search.page,
  };
}
