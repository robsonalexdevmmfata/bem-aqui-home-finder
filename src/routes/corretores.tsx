import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { BrokerCard, BrokerCarousel } from "@/components/site/BrokerCarousel";
import { listBrokers } from "@/lib/public.functions";
import { MOCK_BROKERS } from "@/lib/mock-data";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/corretores")({
  loader: async () => {
    try {
      const rows = await listBrokers();
      return rows?.length >= 8 ? rows : MOCK_BROKERS;
    } catch {
      return MOCK_BROKERS;
    }
  },
  head: () => ({ meta: [{ title: `Corretores — ${SITE.name}` }] }),
  component: CorretoresPage,
});

function CorretoresPage() {
  const brokers = Route.useLoaderData();
  const slides = (brokers?.length ? brokers : MOCK_BROKERS) as typeof MOCK_BROKERS;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Rede"
        title="Corretores parceiros"
        subtitle="Equipe demonstrativa com 12 profissionais — fotos fictícias via Unsplash."
      />
      <div className="container-page space-y-10 py-10">
        <div className="px-8 md:px-2">
          <BrokerCarousel brokers={slides} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((b, i) => (
            <BrokerCard key={b.id} broker={b} index={i} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
