import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [{ title: `Contato — ${SITE.name}` }] }),
  component: ContatoPage,
});

function ContatoPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success("Mensagem registrada. Em produção, ela chega ao atendimento da plataforma.");
  };

  return (
    <SiteShell>
      <PageHero eyebrow="Fale conosco" title="Contato" subtitle="Tire dúvidas sobre imóveis, parcerias ou a plataforma." />
      <div className="container-page max-w-2xl py-10">
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" variant="gold" size="lg" disabled={sent}>
            {sent ? "Enviado" : "Enviar mensagem"}
          </Button>
        </form>
      </div>
    </SiteShell>
  );
}
