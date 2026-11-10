import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PanelShell } from "@/components/site/PanelShell";
import { fetchMyRoles } from "@/hooks/use-auth";

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/imoveis", label: "Aprovações" },
  { to: "/admin/usuarios", label: "Usuários" },
  { to: "/admin/categorias", label: "Categorias" },
  { to: "/admin/banners", label: "Banners" },
  { to: "/admin/parceiros", label: "Parceiros" },
];


export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { userId, roles } = await fetchMyRoles();
    if (!userId) throw redirect({ to: "/auth" });
    if (!roles.includes("admin")) throw redirect({ to: "/conta" });
  },
  component: () => (
    <PanelShell title="Administração" nav={NAV}>
      <Outlet />
    </PanelShell>
  ),
});
