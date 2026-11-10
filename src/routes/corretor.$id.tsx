import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, BadgeCheck } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { PropertyGrid } from "@/components/site/PropertyCard";
import { DemoBadge } from "@/components/site/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getMockBrokerById, MOCK_PROPERTIES, pickMockAvatar } from "@/lib/mock-data";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/corretor/$id")({
  loader: ({ params }) => {
    const broker = getMockBrokerById(params.id);
    if (!broker) throw notFound();
    // Demo: mostra imóveis publicados como carteira ilustrativa do corretor.
    const listings = MOCK_PROPERTIES.filter((p) => p.featured || p.is_investment).slice(0, 6);
    return { broker, listings };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.broker.display_name ?? "Corretor"} — ${SITE.name}` }],
  }),
  component: CorretorPage,
});

function CorretorPage() {
  const { broker, listings } = Route.useLoaderData();
  const photo = broker.photo_url || pickMockAvatar(broker.id.length);

  return (
    <SiteShell>
      <PageHero eyebrow="Corretor" title={broker.display_name} subtitle={broker.bio}>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="gold"><Link to="/contato">Falar com a equipe</Link></Button>
          <Button asChild variant="outline-light"><Link to="/corretores">Ver todos</Link></Button>
        </div>
      </PageHero>
      <div className="container-page space-y-10 py-10">
        <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-soft sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 border-2 border-gold">
            <AvatarImage src={photo} alt={broker.display_name} />
            <AvatarFallback className="bg-navy text-2xl font-bold text-gold">
              {broker.display_name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold text-navy">{broker.display_name}</h2>
              {broker.is_demo && <DemoBadge />}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><BadgeCheck className="h-4 w-4 text-gold" /> CRECI {broker.creci}</span>
              {broker.city && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-gold" /> {broker.city}</span>}
              {broker.agency?.name && <span>{broker.agency.name}</span>}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{broker.bio}</p>
            {broker.specialties?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {broker.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-navy">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-navy">Imóveis em destaque</h3>
          <p className="mt-1 text-sm text-muted-foreground">Seleção ilustrativa associada a este perfil na demonstração.</p>
          <div className="mt-6">
            <PropertyGrid items={listings} />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
