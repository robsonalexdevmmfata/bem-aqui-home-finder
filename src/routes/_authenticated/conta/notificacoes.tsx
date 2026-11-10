import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/conta/notificacoes")({
  head: () => ({ meta: [{ title: `Notificações — ${SITE.name}` }] }),
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    qc.invalidateQueries({ queryKey: ["notifications", user.id] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-navy">Notificações</h1>
        <Button variant="outline" size="sm" onClick={markAll}>Marcar todas como lidas</Button>
      </div>
      <div className="space-y-2">
        {data.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma notificação.</p>}
        {data.map((n) => (
          <Link
            key={n.id}
            to={(n.link ?? "/conta") as "/conta"}
            className={`block rounded-2xl border p-4 shadow-soft ${n.read_at ? "bg-card" : "bg-accent/40"}`}
          >
            <p className="font-semibold">{n.title}</p>
            {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
            <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
