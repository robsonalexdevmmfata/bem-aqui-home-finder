import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: `Termos de uso — ${SITE.name}` }] }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Legal"
        title="Termos de uso"
        subtitle="Condições gerais de utilização da plataforma. Texto demonstrativo para entrega comercial."
      />
      <div className="container-page prose prose-neutral max-w-3xl py-10 dark:prose-invert">
        <h2>1. Aceitação</h2>
        <p>
          Ao acessar a {SITE.name}, você concorda com estes termos e com a{" "}
          <Link to="/privacidade">política de privacidade</Link>.
        </p>
        <h2>2. Contas e perfis</h2>
        <p>
          Existem perfis de cliente, corretor/imobiliária e administrador. Cada um acessa apenas as áreas autorizadas
          (conta, painel profissional ou admin). Credenciais demo não devem ser usadas em produção.
        </p>
        <h2>3. Anúncios e dados fictícios</h2>
        <p>
          Imóveis, corretores, depoimentos e parceiros marcados como fictícios existem apenas para demonstração. Não
          constituem oferta real de negócio.
        </p>
        <h2>4. Propostas e leads</h2>
        <p>
          Propostas, leads e simulações registradas na plataforma têm caráter informativo nesta demo. Em operação real,
          passam a integrar o fluxo comercial entre as partes.
        </p>
        <h2>5. Responsabilidades</h2>
        <p>
          O usuário é responsável pela veracidade das informações enviadas. A plataforma pode moderar, aprovar ou
          remover conteúdos que violem políticas internas.
        </p>
        <h2>6. Contato</h2>
        <p>
          Dúvidas sobre estes termos: página de <Link to="/contato">Contato</Link>.
        </p>
      </div>
    </SiteShell>
  );
}
