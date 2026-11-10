import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: `FAQ — ${SITE.name}` }] }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "Como faço login na demonstração?",
    a: "Use admin@bemaqui.com, corretor@bemaqui.com ou cliente@bemaqui.com com a senha 123456 na página Entrar.",
  },
  {
    q: "Os imóveis são reais?",
    a: "Não. Os anúncios, fotos, corretores e depoimentos desta entrega são fictícios, para apresentar o produto.",
  },
  {
    q: "Como anunciar um imóvel?",
    a: "Crie ou acesse uma conta profissional, vá em Anunciar e use o painel do corretor para cadastrar o imóvel com fotos.",
  },
  {
    q: "O que os simuladores fazem?",
    a: "O simulador financeiro calcula SAC/PRICE; a valorização projeta cenários; a análise estima rentabilidade de investimento.",
  },
  {
    q: "Como funciona a LGPD na plataforma?",
    a: "Há consentimento no cadastro, política pública e, na área logada, opções de exportar ou solicitar exclusão dos dados.",
  },
  {
    q: "Posso falar com um corretor?",
    a: "Sim. Na listagem de corretores abra o perfil do profissional ou use a página de Contato / WhatsApp do site.",
  },
];

function FaqPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Ajuda"
        title="Perguntas frequentes"
        subtitle="Respostas rápidas sobre a demonstração da plataforma."
      />
      <div className="container-page max-w-3xl py-10">
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4 shadow-soft">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-navy">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="gold"><Link to="/contato">Ainda preciso de ajuda</Link></Button>
          <Button asChild variant="outline"><Link to="/auth">Entrar na plataforma</Link></Button>
        </div>
      </div>
    </SiteShell>
  );
}
