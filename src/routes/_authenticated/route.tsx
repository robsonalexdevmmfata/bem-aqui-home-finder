import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { hasSupabaseEnv } from "@/lib/env";
import { getMockSession } from "@/lib/mock-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (!hasSupabaseEnv()) {
      const mock = getMockSession();
      if (!mock) throw redirect({ to: "/auth", search: { redirect: location.href } });
      return { userId: mock.user.id };
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const mock = getMockSession();
        if (mock) return { userId: mock.user.id };
        throw redirect({ to: "/auth", search: { redirect: location.href } });
      }
      return { userId: data.user.id };
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) throw err;
      const mock = getMockSession();
      if (!mock) throw redirect({ to: "/auth", search: { redirect: location.href } });
      return { userId: mock.user.id };
    }
  },
  component: () => <Outlet />,
});
