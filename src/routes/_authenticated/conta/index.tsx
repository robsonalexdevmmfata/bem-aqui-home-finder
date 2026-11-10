import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ACCOUNT_STATUS, ROLE_LABEL } from "@/lib/format";
import { StatusBadge } from "@/components/site/StatusBadge";
import { PanelStat } from "@/components/site/PanelShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/conta/")({
  head: () => ({ meta: [{ title: `Minha conta — ${SITE.name}` }] }),
  component: ContaHome,
});

function ContaHome() {
  const { profile, user, roles, isAdmin, isPro, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [saving, setSaving] = useState(false);

  const mainRole = isAdmin ? "admin" : roles.includes("agency") ? "agency" : roles.includes("broker") ? "broker" : "client";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null, city: city.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Olá, {profile?.full_name || "cliente"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie seus dados, favoritos e propostas.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PanelStat label="Tipo de conta" value={ROLE_LABEL[mainRole]} />
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
          <div className="mt-3">
            <StatusBadge map={ACCOUNT_STATUS} value={profile?.status ?? "pending"} />
          </div>
        </div>
        <PanelStat label="E-mail" value={profile?.email || user?.email || "—"} />
      </div>

      <form onSubmit={save} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="font-semibold text-navy">Dados pessoais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nome</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="gold" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          {isPro && <Button asChild variant="navy"><Link to="/painel">Painel profissional</Link></Button>}
          {isAdmin && <Button asChild variant="outline"><Link to="/admin">Admin</Link></Button>}
          <Button type="button" variant="outline" onClick={() => signOut()}>Sair</Button>
        </div>
      </form>
    </div>
  );
}
