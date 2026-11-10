import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  account_type: string;
  status: string;
  lgpd_consent_at: string | null;
  marketing_consent: boolean;
  is_demo: boolean;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  ready: boolean;
  roles: string[];
  profile: Profile | null;
  isAdmin: boolean;
  isPro: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") qc.invalidateQueries();
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, qc]);

  const userId = session?.user.id;
  const { data: me } = useQuery({
    queryKey: ["me", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      return { profile: profile as Profile | null, roles: (roles ?? []).map((r) => r.role as string) };
    },
  });

  const roles = me?.roles ?? [];
  const value: AuthState = {
    session,
    user: session?.user ?? null,
    ready,
    roles,
    profile: me?.profile ?? null,
    isAdmin: roles.includes("admin"),
    isPro: roles.some((r) => r === "broker" || r === "agency" || r === "admin"),
    signOut: async () => {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      router.navigate({ to: "/auth", replace: true });
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}

/** Fetch current user's roles (used by route guards). */
export async function fetchMyRoles(): Promise<{ userId: string | null; roles: string[] }> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id ?? null;
  if (!uid) return { userId: null, roles: [] };
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
  return { userId: uid, roles: (roles ?? []).map((r) => r.role as string) };
}
