import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: `Privacidade — ${SITE.name}` }] }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <SiteShell>
      <PageHero eyebrow="LGPD" title="Privacidade e proteção de dados" subtitle="Como tratamos seus dados na plataforma BEM AQUI IMÓVEIS." />
      <div className="container-page prose prose-neutral max-w-3xl py-10 dark:prose-invert">
        <h2>1. Controlador</h2>
        <p>A plataforma {SITE.name} trata dados pessoais para viabilizar cadastro, atendimento, propostas e operação dos painéis.</p>
        <h2>2. Dados coletados</h2>
        <p>Nome, e-mail, telefone, cidade, preferências de marketing, dados de imóveis anunciados e registros de interesse/propostas.</p>
        <h2>3. Bases legais</h2>
        <p>Execução de contrato, consentimento (incluindo marketing e formulários de interesse) e legítimo interesse para segurança e prevenção a fraudes.</p>
        <h2>4. Seus direitos</h2>
        <p>Na área logada (/conta) você pode atualizar dados, solicitar exportação e pedir exclusão da conta, conforme políticas internas e obrigações legais.</p>
        <h2>5. Contato</h2>
        <p>Para exercer direitos LGPD, utilize a página de Contato informando o assunto “Privacidade”.</p>
      </div>
    </SiteShell>
  );
}
