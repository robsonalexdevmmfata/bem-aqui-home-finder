import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PanelShell } from "@/components/site/PanelShell";
import { fetchMyRoles } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/painel", label: "Dashboard", exact: true },
  { to: "/painel/imoveis", label: "Imóveis" },
  { to: "/painel/leads", label: "Leads" },
  { to: "/painel/propostas", label: "Propostas" },
  { to: "/painel/relatorios", label: "Relatórios" },
];


export const Route = createFileRoute("/_authenticated/painel")({
  beforeLoad: async () => {
    const { userId, roles } = await fetchMyRoles();
    if (!userId) throw redirect({ to: "/auth" });
    const isPro = roles.some((r) => r === "broker" || r === "agency" || r === "admin");
    if (!isPro) throw redirect({ to: "/conta" });
    const { data: profile } = await supabase.from("profiles").select("status").eq("id", userId).maybeSingle();
    return { profileStatus: profile?.status ?? "pending" };
  },
  component: () => (
    <PanelShell title="Painel profissional" nav={NAV}>
      <Outlet />
    </PanelShell>
  ),
});
