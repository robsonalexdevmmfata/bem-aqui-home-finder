import { createFileRoute } from "@tanstack/react-router";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { DemoBadge } from "@/components/site/StatusBadge";
import { listBrokers } from "@/lib/public.functions";
import { SITE } from "@/lib/config";

export const Route = createFileRoute("/corretores")({
  loader: () => listBrokers(),
  head: () => ({ meta: [{ title: `Corretores — ${SITE.name}` }] }),
  component: CorretoresPage,
});

function CorretoresPage() {
  const brokers = Route.useLoaderData();
  return (
    <SiteShell>
      <PageHero eyebrow="Rede" title="Corretores parceiros" subtitle="Profissionais aprovados para atender compradores e investidores." />
      <div className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {brokers.map((b) => (
          <article key={b.id} className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy font-display text-xl font-bold text-gold">
                {(b.display_name ?? "?").slice(0, 1)}
              </div>
              {b.is_demo && <DemoBadge />}
            </div>
            <h2 className="mt-4 font-semibold text-navy">{b.display_name}</h2>
            <p className="text-xs text-muted-foreground">
              CRECI {b.creci ?? "—"}
              {b.city ? ` · ${b.city}` : ""}
              {(b.agency as { name?: string } | null)?.name ? ` · ${(b.agency as { name: string }).name}` : ""}
            </p>
            {b.bio && <p className="mt-3 text-sm text-muted-foreground line-clamp-4">{b.bio}</p>}
            {Array.isArray(b.specialties) && b.specialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
