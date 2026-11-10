import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { downloadJson } from "@/lib/property-media";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/conta/privacidade")({
  head: () => ({ meta: [{ title: `LGPD — ${SITE.name}` }] }),
  component: ContaPrivacidadePage,
});

function ContaPrivacidadePage() {
  const { user, profile, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const exportData = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const [favorites, proposals, leads, notifications] = await Promise.all([
        supabase.from("favorites").select("*").eq("user_id", user.id),
        supabase.from("proposals").select("*").eq("client_id", user.id),
        supabase.from("leads").select("*").eq("user_id", user.id),
        supabase.from("notifications").select("*").eq("user_id", user.id),
      ]);

      const payload = {
        exportedAt: new Date().toISOString(),
        platform: SITE.name,
        profile: profile ?? { id: user.id, email: user.email },
        favorites: favorites.data ?? [],
        proposals: proposals.data ?? [],
        leads: leads.data ?? [],
        notifications: notifications.data ?? [],
        note:
          !favorites.data?.length && !proposals.data?.length
            ? "Exportação com pouco volume — estrutura pronta para LGPD (demo)."
            : undefined,
      };
      downloadJson(`lgpd-export-${user.id.slice(0, 8)}.json`, payload);
      toast.success("Exportação baixada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao exportar");
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!user || !confirmDelete) {
      toast.message("Confirme a exclusão marcando a caixa");
      return;
    }
    setBusy(true);
    // Soft-delete demo: limpa dados pessoais locais e encerra sessão.
    // Exclusão definitiva de auth.users exige service role no backend.
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: "Conta excluída",
        phone: null,
        avatar_url: null,
        city: null,
        marketing_consent: false,
        status: "suspended",
      })
      .eq("id", user.id);

    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Solicitação de exclusão registrada. Sessão encerrada.");
    await signOut();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Privacidade (LGPD)</h1>
        <p className="mt-1 text-sm text-muted-foreground">Exporte seus dados ou solicite a exclusão da conta.</p>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-3">
        <h2 className="font-semibold text-navy">Exportar meus dados</h2>
        <p className="text-sm text-muted-foreground">
          Gera um arquivo JSON com perfil, favoritos, propostas, leads e notificações vinculados à sua conta.
        </p>
        <Button variant="gold" disabled={busy} onClick={() => void exportData()}>
          {busy ? "Preparando..." : "Baixar exportação"}
        </Button>
      </section>

      <section className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-soft space-y-3">
        <h2 className="font-semibold text-destructive">Excluir conta</h2>
        <p className="text-sm text-muted-foreground">
          Na demo, anonimizamos o perfil e encerramos a sessão. Em produção, a exclusão completa do login é feita no backend com service role.
        </p>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={confirmDelete} onCheckedChange={(v) => setConfirmDelete(v === true)} className="mt-0.5" />
          Entendo que esta ação é irreversível na demonstração e desejo excluir/anonimizar minha conta.
        </label>
        <Button variant="destructive" disabled={busy || !confirmDelete} onClick={() => void deleteAccount()}>
          Confirmar exclusão
        </Button>
      </section>
    </div>
  );
}
