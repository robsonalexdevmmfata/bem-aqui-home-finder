import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, LEAD_STATUS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/painel/leads")({
  head: () => ({ meta: [{ title: `Leads — ${SITE.name}` }] }),
  component: PainelLeads,
});

function PainelLeads() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["painel-leads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, email, phone, message, status, created_at, property:properties(title)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status: status as "new" }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["painel-leads", user?.id] });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-navy">Leads</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      <div className="space-y-3">
        {data.map((lead) => (
          <article key={lead.id} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{lead.name}</p>
                <p className="text-sm text-muted-foreground">
                  {lead.email} {lead.phone ? `· ${lead.phone}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(lead.property as { title?: string } | null)?.title ?? "Imóvel"} · {formatDateTime(lead.created_at)}
                </p>
                {lead.message && <p className="mt-2 text-sm">{lead.message}</p>}
              </div>
              <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </article>
        ))}
        {!isLoading && data.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhum lead ainda.</div>
        )}
      </div>
      <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["painel-leads", user?.id] })}>Atualizar</Button>
    </div>
  );
}
