import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { PropertyGrid } from "@/components/site/PropertyCard";
import { PropertySearch } from "@/components/site/PropertySearch";
import { listProperties, getCategories } from "@/lib/public.functions";
import { listingSearchSchema, toPropertyFilters } from "@/lib/listing-search";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/alugar")({
  validateSearch: listingSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const filters = toPropertyFilters(deps, { purpose: "aluguel" });
    const [result, categories] = await Promise.all([listProperties({ data: filters }), getCategories()]);
    return { ...result, categories, filters };
  },
  head: () => ({ meta: [{ title: `Alugar — ${SITE.name}` }] }),
  component: AlugarPage,
});

function AlugarPage() {
  const { items, total, categories, filters } = Route.useLoaderData();
  return (
    <SiteShell>
      <PageHero eyebrow="Locação" title="Imóveis para alugar" subtitle={`${total} imóveis disponíveis para locação.`}>
        <div className="mt-6">
          <PropertySearch initial={filters} categories={categories} onSubmitPath="/alugar" />
        </div>
      </PageHero>
      <div className="container-page py-10">
        <PropertyGrid items={items} />
      </div>
    </SiteShell>
  );
}
