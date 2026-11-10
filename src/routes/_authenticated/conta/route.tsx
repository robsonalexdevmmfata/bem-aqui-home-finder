import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PanelShell } from "@/components/site/PanelShell";

const NAV = [
  { to: "/conta", label: "Visão geral", exact: true },
  { to: "/conta/favoritos", label: "Favoritos" },
  { to: "/conta/propostas", label: "Propostas" },
  { to: "/conta/notificacoes", label: "Notificações" },
  { to: "/conta/privacidade", label: "LGPD" },
];


export const Route = createFileRoute("/_authenticated/conta")({
  component: () => (
    <PanelShell title="Minha conta" nav={NAV}>
      <Outlet />
    </PanelShell>
  ),
});
