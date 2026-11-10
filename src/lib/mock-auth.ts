import { MOCK_DEMO_USERS } from "@/lib/mock-data";

const STORAGE_KEY = "bemaqui_mock_session";

export type MockSession = {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    city: string;
    account_type: string;
    status: "approved";
    lgpd_consent_at: string;
    marketing_consent: boolean;
    is_demo: true;
  };
  roles: string[];
};

function readStorage(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

function writeStorage(session: MockSession | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getMockSession(): MockSession | null {
  return readStorage();
}

export function mockSignIn(email: string, password: string): MockSession {
  const user = MOCK_DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new Error("E-mail ou senha inválidos (demo: senha 123456)");
  }
  const session: MockSession = {
    user: { id: user.id, email: user.email },
    profile: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: null,
      avatar_url: null,
      city: "São Paulo",
      account_type: user.account_type,
      status: "approved",
      lgpd_consent_at: new Date().toISOString(),
      marketing_consent: false,
      is_demo: true,
    },
    roles: [...user.roles],
  };
  writeStorage(session);
  return session;
}

export function mockSignOut() {
  writeStorage(null);
}

export function mockResolveHome(roles: string[]) {
  if (roles.includes("admin")) return "/admin" as const;
  if (roles.some((r) => r === "broker" || r === "agency")) return "/painel" as const;
  return "/conta" as const;
}
