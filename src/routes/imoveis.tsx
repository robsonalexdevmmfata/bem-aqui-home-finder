import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { PropertyGrid } from "@/components/site/PropertyCard";
import { PropertySearch } from "@/components/site/PropertySearch";
import { listProperties, getCategories } from "@/lib/public.functions";
import { listingSearchSchema, toPropertyFilters } from "@/lib/listing-search";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/imoveis")({
  validateSearch: listingSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [result, categories] = await Promise.all([
      listProperties({ data: toPropertyFilters(deps) }),
      getCategories(),
    ]);
    return { ...result, categories };
  },
  head: () => ({ meta: [{ title: `Imóveis — ${SITE.name}` }] }),
  component: ImoveisPage,
});

function ImoveisPage() {
  const search = Route.useSearch();
  const { items, total, categories } = Route.useLoaderData();

  return (
    <SiteShell>
      <PageHero eyebrow="Busca" title="Encontre o imóvel certo" subtitle={`${total} imóvel(is) publicado(s) na plataforma.`}>
        <div className="mt-6">
          <PropertySearch initial={toPropertyFilters(search)} categories={categories} />
        </div>
      </PageHero>
      <div className="container-page py-10">
        <PropertyGrid items={items} />
      </div>
    </SiteShell>
  );
}
