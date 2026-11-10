import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCOUNT_STATUS, ROLE_LABEL, formatDate } from "@/lib/format";
import { StatusBadge, DemoBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({ meta: [{ title: `Usuários — ${SITE.name}` }] }),
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, account_type, status, city, is_demo, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: "approved" | "rejected" | "suspended") => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Usuários</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="space-y-3">
        {data.map((u) => (
          <article key={u.id} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">{u.full_name || "Sem nome"}</p>
                  {u.is_demo && <DemoBadge />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {u.email} · {ROLE_LABEL[u.account_type] ?? u.account_type} · {u.city ?? "—"} · {formatDate(u.created_at)}
                </p>
              </div>
              <StatusBadge map={ACCOUNT_STATUS} value={u.status} />
            </div>
            {u.status !== "approved" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="gold" onClick={() => setStatus(u.id, "approved")}>Aprovar</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "rejected")}>Recusar</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(u.id, "suspended")}>Suspender</Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
