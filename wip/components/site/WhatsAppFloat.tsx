import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { integrations, whatsappLink } from "@/lib/config";

export function WhatsAppFloat() {
  const href = whatsappLink(integrations.whatsappNumber, "Olá! Vim pelo site BEM AQUI IMÓVEIS e gostaria de atendimento.");
  const cls = "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-navy shadow-lift transition-transform hover:scale-105 no-print";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label="Atendimento pelo WhatsApp">
        <MessageCircle className="h-7 w-7" />
      </a>
    );
  }
  // Platform number not configured yet: route to the contact page instead of a fake number.
  return (
    <Link to="/contato" className={cls} aria-label="Fale conosco" title="Atendimento">
      <MessageCircle className="h-7 w-7" />
    </Link>
  );
}
