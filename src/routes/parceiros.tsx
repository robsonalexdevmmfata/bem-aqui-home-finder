import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ExternalLink } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/site/StatusBadge";
import { MOCK_PARTNERS } from "@/lib/mock-data";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/parceiros")({
  head: () => ({ meta: [{ title: `Parceiros — ${SITE.name}` }] }),
  component: ParceirosPage,
});

function ParceirosPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Rede"
        title="Parceiros do ecossistema"
        subtitle="Empresas que apoiam financiamento, documentação, seguro, mídia e operação imobiliária — dados fictícios para demonstração."
      >
        <div className="mt-6">
          <Button asChild variant="gold"><Link to="/contato">Quero ser parceiro</Link></Button>
        </div>
      </PageHero>
      <div className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MOCK_PARTNERS.map((p) => (
            <article key={p.id} className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                  <Building2 className="h-5 w-5" />
                </div>
                {p.is_demo && <DemoBadge />}
              </div>
              <h2 className="mt-4 font-semibold text-navy">{p.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
              {p.website && (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
                >
                  Visitar site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
