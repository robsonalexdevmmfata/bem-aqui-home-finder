import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/env";
import { getMockSession, mockSignOut, type MockSession } from "@/lib/mock-auth";

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
  mockMode: boolean;
  signOut: () => Promise<void>;
  refreshMockSession: () => void;
};

const Ctx = createContext<AuthState | null>(null);

function mockToUser(m: MockSession): User {
  return {
    id: m.user.id,
    email: m.user.email,
    app_metadata: {},
    user_metadata: { full_name: m.profile.full_name },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mockMode = !hasSupabaseEnv();
  const [session, setSession] = useState<Session | null>(null);
  const [mock, setMock] = useState<MockSession | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  const refreshMockSession = () => setMock(getMockSession());

  useEffect(() => {
    let mounted = true;

    if (mockMode) {
      setMock(getMockSession());
      setReady(true);
      return () => {
        mounted = false;
      };
    }

    let unsubscribe = () => {};
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        setReady(true);
        const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
          setSession(s);
          if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
          router.invalidate();
          if (event !== "SIGNED_OUT") qc.invalidateQueries();
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      } catch (err) {
        console.warn("[auth] Supabase indisponível, caindo para modo mock:", err);
        if (!mounted) return;
        setMock(getMockSession());
        setReady(true);
      }
    })();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [mockMode, router, qc]);

  const userId = mockMode ? mock?.user.id : session?.user.id;
  const { data: me } = useQuery({
    queryKey: ["me", userId, mockMode],
    enabled: !!userId && !mockMode,
    queryFn: async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      return { profile: profile as Profile | null, roles: (roles ?? []).map((r) => r.role as string) };
    },
  });

  const roles = mockMode ? mock?.roles ?? [] : me?.roles ?? [];
  const profile = mockMode ? mock?.profile ?? null : me?.profile ?? null;
  const user = mockMode ? (mock ? mockToUser(mock) : null) : session?.user ?? null;

  const value: AuthState = {
    session: mockMode ? null : session,
    user,
    ready,
    roles,
    profile,
    isAdmin: roles.includes("admin"),
    isPro: roles.some((r) => r === "broker" || r === "agency" || r === "admin"),
    mockMode,
    refreshMockSession,
    signOut: async () => {
      await qc.cancelQueries();
      qc.clear();
      if (mockMode || !hasSupabaseEnv()) {
        mockSignOut();
        setMock(null);
      } else {
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase.auth.signOut();
      }
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
  if (!hasSupabaseEnv()) {
    const mock = getMockSession();
    return { userId: mock?.user.id ?? null, roles: mock?.roles ?? [] };
  }
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id ?? null;
    if (!uid) return { userId: null, roles: [] };
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    return { userId: uid, roles: (roles ?? []).map((r) => r.role as string) };
  } catch {
    const mock = getMockSession();
    return { userId: mock?.user.id ?? null, roles: mock?.roles ?? [] };
  }
}
