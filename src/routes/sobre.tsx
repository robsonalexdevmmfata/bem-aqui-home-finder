import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: `Sobre — ${SITE.name}` }] }),
  component: SobrePage,
});

const PILLARS = [
  {
    icon: Building2,
    title: "Portal completo",
    desc: "Compra, aluguel, anúncio e investimento em um só ecossistema digital.",
  },
  {
    icon: Handshake,
    title: "Rede comercial",
    desc: "Corretores, imobiliárias e parceiros conectados a leads e propostas.",
  },
  {
    icon: Sparkles,
    title: "Ferramentas inteligentes",
    desc: "Simuladores financeiros, valorização e análise de rentabilidade.",
  },
  {
    icon: ShieldCheck,
    title: "Confiança e LGPD",
    desc: "Consentimento, painéis por perfil e proteção de dados pessoais.",
  },
];

function SobrePage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Institucional"
        title={`Sobre a ${SITE.name}`}
        subtitle={`${SITE.slogan} Uma plataforma pensada para compradores, locatários, corretores e investidores.`}
      />
      <div className="container-page space-y-12 py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">Nossa proposta</h2>
            <div className="gold-rule mt-3" />
            <p className="mt-4 text-muted-foreground">
              A {SITE.name} nasceu para unificar a jornada imobiliária: descobrir imóveis, falar com profissionais,
              simular financiamento, enviar propostas e acompanhar tudo em painéis claros — com dados fictícios nesta
              demonstração comercial.
            </p>
            <p className="mt-3 text-muted-foreground">
              O produto cobre o fluxo completo do mercado: catálogo público com SEO, área do cliente, painel do corretor
              e administração centralizada.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="gold"><Link to="/imoveis">Ver imóveis</Link></Button>
              <Button asChild variant="outline"><Link to="/contato">Falar com a gente</Link></Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
              alt="Ambiente residencial moderno"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-navy">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-navy">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
