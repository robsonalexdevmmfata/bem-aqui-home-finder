import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { PropertyGrid } from "@/components/site/PropertyCard";
import { Button } from "@/components/ui/button";
import { listProperties } from "@/lib/public.functions";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/investir")({
  loader: () => listProperties({ data: { investment: true, sort: "recent" } }),
  head: () => ({ meta: [{ title: `Investir — ${SITE.name}` }] }),
  component: InvestirPage,
});

function InvestirPage() {
  const { items, total } = Route.useLoaderData();
  return (
    <SiteShell>
      <PageHero
        eyebrow="Investimento"
        title="Oportunidades para investir"
        subtitle={`${total} imóvel(is) com potencial de retorno. Use os simuladores para projetar cenários.`}
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="gold"><Link to="/analise-investimento">Análise de investimento</Link></Button>
          <Button asChild variant="outline-light"><Link to="/valorizacao">Projeção de valorização</Link></Button>
          <Button asChild variant="outline-light"><Link to="/simulador">Simulador financeiro</Link></Button>
        </div>
      </PageHero>
      <div className="container-page py-10">
        <PropertyGrid items={items} />
      </div>
    </SiteShell>
  );
}
