import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PanelStat } from "@/components/site/PanelShell";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: `Admin — ${SITE.name}` }] }),
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, pendingProps, published, pendingAccounts] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      return {
        users: users.count ?? 0,
        pendingProps: pendingProps.count ?? 0,
        published: published.count ?? 0,
        pendingAccounts: pendingAccounts.count ?? 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Painel administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Controle de usuários, aprovações e saúde da plataforma.</p>
        </div>
        <Button asChild variant="gold"><Link to="/admin/imoveis">Ir para aprovações</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PanelStat label="Usuários" value={data?.users ?? "—"} />
        <PanelStat label="Contas pendentes" value={data?.pendingAccounts ?? "—"} />
        <PanelStat label="Imóveis pendentes" value={data?.pendingProps ?? "—"} />
        <PanelStat label="Publicados" value={data?.published ?? "—"} />
      </div>
    </div>
  );
}
