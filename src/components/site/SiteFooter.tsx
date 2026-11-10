import { Link } from "@tanstack/react-router";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { SITE } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground no-print">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-navy-foreground/70">{SITE.slogan} Plataforma completa para comprar, alugar, anunciar e investir em imóveis com segurança.</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-navy-foreground/60">
            <ShieldCheck className="h-4 w-4 text-gold" /> Dados protegidos conforme a LGPD
          </div>
        </div>
        <FooterCol title="Imóveis" links={[["/comprar", "Comprar"], ["/alugar", "Alugar"], ["/imoveis", "Buscar imóveis"], ["/corretores", "Corretores"]]} />
        <FooterCol title="Ferramentas" links={[["/simulador", "Simulador financeiro"], ["/valorizacao", "Projeção de valorização"], ["/analise-investimento", "Análise de investimento"], ["/anunciar", "Anunciar imóvel"]]} />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Institucional</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/75">
            <li><Link to="/contato" className="hover:text-gold">Contato</Link></li>
            <li><Link to="/privacidade" className="hover:text-gold">Privacidade e LGPD</Link></li>
            <li><Link to="/auth" className="hover:text-gold">Área do cliente</Link></li>
            <li className="flex items-center gap-2 pt-2"><Mail className="h-4 w-4 text-gold" /> Use o formulário de contato</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Atendimento em todo o Brasil</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{" "}
            <a
              href="https://agenciainfotech.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold hover:underline"
            >
              Agencia Info Tech Ltda
            </a>
          </p>
        </div>
        <div className="container-page pb-5 text-[11px] text-navy-foreground/45">
          Imóveis, corretores e depoimentos marcados como fictícios são apenas para demonstração.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/75">
        {links.map(([to, label]) => (
          <li key={to}><Link to={to as "/"} className="hover:text-gold">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
