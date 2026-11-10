import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Camera, FileCheck2, Megaphone } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/anunciar")({
  head: () => ({ meta: [{ title: `Anunciar — ${SITE.name}` }] }),
  component: AnunciarPage,
});

function AnunciarPage() {
  const { user, isPro, profile } = useAuth();
  const approved = profile?.status === "approved";

  return (
    <SiteShell>
      <PageHero
        eyebrow="Anuncie"
        title="Publique seu imóvel com padrão profissional"
        subtitle="Cadastro completo com fotos, vídeos, localização e fluxo de aprovação."
      />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            [Megaphone, "Alcance compradores e investidores"],
            [Camera, "Galeria de fotos e vídeos"],
            [FileCheck2, "Publicação após aprovação"],
            [CheckCircle2, "Leads e propostas no painel"],
          ].map(([Icon, text]) => (
            <div key={String(text)} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-soft">
              <Icon className="mt-0.5 h-5 w-5 text-gold" />
              <p className="font-medium">{text as string}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border bg-navy p-6 text-navy-foreground shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Comece agora</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Painel do corretor</h2>
          <p className="mt-3 text-sm text-navy-foreground/75">
            Contas profissionais usam o painel para cadastrar imóveis, receber leads e acompanhar propostas.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!user && (
              <Button asChild variant="gold" size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>Criar conta profissional</Link>
              </Button>
            )}
            {user && isPro && approved && (
              <Button asChild variant="gold" size="lg">
                <Link to="/painel/imoveis">Ir para meus imóveis</Link>
              </Button>
            )}
            {user && isPro && !approved && (
              <p className="text-sm text-gold">Sua conta profissional ainda está em análise.</p>
            )}
            {user && !isPro && (
              <p className="text-sm text-navy-foreground/80">
                Sua conta é de cliente. Crie um perfil de corretor em Contato ou peça upgrade ao admin.
              </p>
            )}
            <Button asChild variant="outline-light">
              <Link to="/auth">Já tenho login</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
