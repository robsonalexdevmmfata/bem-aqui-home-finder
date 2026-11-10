import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Handshake,
  Home,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PropertyCard } from "@/components/site/PropertyCard";
import { PropertySearch } from "@/components/site/PropertySearch";
import { BrokerCarousel, TestimonialCarousel } from "@/components/site/BrokerCarousel";
import { Button } from "@/components/ui/button";
import { getHomeData } from "@/lib/public.functions";
import { MOCK_BROKERS, MOCK_PARTNERS, MOCK_TESTIMONIALS } from "@/lib/mock-data";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: `${SITE.name} — ${SITE.hero}` },
      { name: "description", content: SITE.slogan },
    ],
  }),
  component: HomePage,
});

const PILLARS = [
  { icon: Home, title: "Comprar e Alugar", desc: "Busca completa com filtros e detalhes reais.", to: "/imoveis" as const },
  { icon: Handshake, title: "Anunciar Imóvel", desc: "Publique com fotos, vídeos e aprovação.", to: "/anunciar" as const },
  { icon: BarChart3, title: "Investir", desc: "Simuladores e análise de rentabilidade.", to: "/investir" as const },
  { icon: Users, title: "Parcerias", desc: "Corretores, imobiliárias e rede comercial.", to: "/parceiros" as const },
];

function HomePage() {
  const data = Route.useLoaderData();
  const heroImage =
    data.featured[0]?.images?.slice().sort((a, b) => a.position - b.position)[0]?.url ??
    data.recent[0]?.images?.slice().sort((a, b) => a.position - b.position)[0]?.url ??
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80";

  return (
    <SiteShell transparentHeader>
      <section className="relative min-h-[88vh] overflow-hidden bg-navy">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container-page relative flex min-h-[88vh] flex-col justify-end gap-8 pb-14 pt-28 lg:justify-center lg:pb-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Plataforma completa de negócios imobiliários</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-navy-foreground sm:text-5xl lg:text-6xl">
              {SITE.hero}
            </h1>
            <p className="mt-4 max-w-xl text-base text-navy-foreground/80 sm:text-lg">{SITE.slogan}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/imoveis">Explorar imóveis</Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link to="/anunciar">Anunciar agora</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <Link
                key={p.title}
                to={p.to}
                className="group rounded-2xl border border-navy-foreground/15 bg-navy-foreground/10 p-4 backdrop-blur transition hover:border-gold/50 hover:bg-navy-foreground/15"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-soft">
                  <p.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-semibold text-navy-foreground">{p.title}</p>
                <p className="mt-1 text-xs text-navy-foreground/70">{p.desc}</p>
              </Link>
            ))}
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <PropertySearch categories={data.categories} />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Destaques"
        title="Imóveis em evidência"
        subtitle="Seleção premium para compra e locação."
        action={<Button asChild variant="outline"><Link to="/imoveis">Ver todos</Link></Button>}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(data.featured.length ? data.featured : data.recent).slice(0, 6).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </Section>

      <section className="bg-surface py-14">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <Block title="Para comprar" link="/comprar" items={data.sale} />
          <Block title="Para alugar" link="/alugar" items={data.rent} />
        </div>
      </section>

      <Section
        eyebrow="Investimento"
        title="Oportunidades com potencial de retorno"
        subtitle="Imóveis marcados para análise de rentabilidade."
        action={<Button asChild variant="gold"><Link to="/investir">Analisar oportunidades</Link></Button>}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.invest.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </Section>

      <section className="bg-navy py-14 text-navy-foreground">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Recursos exclusivos</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Tudo que o mercado imobiliário precisa</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Simulador financeiro", "SAC e PRICE com cenários personalizados", "/simulador"],
              ["Projeção de valorização", "Conservador, base e otimista", "/valorizacao"],
              ["Análise de investimento", "Rentabilidade e aluguel estimado", "/analise-investimento"],
              ["Propostas e negociação", "Fluxo transparente entre cliente e corretor", "/auth"],
              ["Painel do corretor", "Leads, imóveis e performance", "/painel"],
              ["Segurança LGPD", "Consentimento, exportação e exclusão", "/privacidade"],
            ].map(([title, desc, to]) => (
              <Link key={title} to={to as "/"} className="rounded-2xl border border-navy-foreground/10 bg-navy-foreground/5 p-5 transition hover:border-gold/40">
                <Sparkles className="h-5 w-5 text-gold" />
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-navy-foreground/70">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section
        eyebrow="Equipe"
        title="Corretores em destaque"
        subtitle="12 profissionais em slides — fotos e dados fictícios para demonstração."
        action={<Button asChild variant="outline"><Link to="/corretores">Ver corretores</Link></Button>}
      >
        <div className="px-8 md:px-2">
          <BrokerCarousel brokers={MOCK_BROKERS} />
        </div>
      </Section>

      <section className="bg-surface py-14">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Depoimentos</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy">Quem já encontrou o endereço certo</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">12 depoimentos fictícios em slides, com fotos de perfil demonstrativas.</p>
          <div className="gold-rule mt-3" />
          <div className="mt-8 px-8 md:px-2">
            <TestimonialCarousel items={MOCK_TESTIMONIALS} />
          </div>
        </div>
      </section>

      <section className="bg-gold py-10">
        <div className="container-page flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-8 w-8 text-gold-foreground" />
            <div>
              <p className="font-display text-xl font-bold text-gold-foreground">Uma solução robusta, intuitiva e inteligente</p>
              <p className="mt-1 text-sm text-gold-foreground/80">Para transformar o mercado imobiliário com tecnologia e confiança.</p>
            </div>
          </div>
          <Button asChild variant="navy" size="lg">
            <Link to="/auth">Acessar plataforma</Link>
          </Button>
        </div>
      </section>

      <Section
        eyebrow="Parceiros"
        title="Rede de apoio ao negócio"
        subtitle="Financiamento, seguro, jurídico e operação — parceiros demonstrativos."
        action={<Button asChild variant="outline"><Link to="/parceiros">Ver parceiros</Link></Button>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(data.partners.length ? data.partners : MOCK_PARTNERS).slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <Building2 className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                {p.description && <p className="line-clamp-1 text-xs text-muted-foreground">{p.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
            <h2 className="mt-2 font-display text-3xl font-bold text-navy">{title}</h2>
            <div className="gold-rule mt-3" />
            {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Block({ title, link, items }: { title: string; link: "/comprar" | "/alugar"; items: Awaited<ReturnType<typeof getHomeData>>["sale"] }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-2xl font-bold text-navy">{title}</h3>
        <Button asChild variant="ghost" size="sm"><Link to={link}>Ver mais</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.slice(0, 4).map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
}
