import { createFileRoute } from "@tanstack/react-router";
import { Building2, ExternalLink } from "lucide-react";
import { DemoBadge } from "@/components/site/StatusBadge";
import { MOCK_PARTNERS } from "@/lib/mock-data";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/_authenticated/admin/parceiros")({
  head: () => ({ meta: [{ title: `Parceiros — Admin — ${SITE.name}` }] }),
  component: AdminParceirosPage,
});

function AdminParceirosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Parceiros</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rede comercial demonstrativa. Em produção, o CMS sincroniza com a tabela de parceiros.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Parceiro</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">Descrição</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Site</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PARTNERS.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-navy">{p.name}</span>
                  </div>
                </td>
                <td className="hidden max-w-md px-4 py-3 text-muted-foreground md:table-cell">{p.description}</td>
                <td className="px-4 py-3">
                  {p.is_demo ? <DemoBadge /> : <span className="text-xs text-success">Ativo</span>}
                </td>
                <td className="px-4 py-3">
                  {p.website ? (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">
                      Abrir <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
