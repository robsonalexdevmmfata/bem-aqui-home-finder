import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, fetchMyRoles } from "@/hooks/use-auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getMockSession, mockResolveHome, mockSignIn } from "@/lib/mock-auth";
import { SITE } from "@/lib/config";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  mode: z.enum(["login", "signup", "forgot"]).optional().catch("login"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  ssr: false,
  beforeLoad: async ({ search }) => {
    if (!hasSupabaseEnv()) {
      const mock = getMockSession();
      if (mock) throw redirect({ to: await resolveHome(search.redirect, mock.roles) });
      return;
    }
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getUser();
      if (data.user) throw redirect({ to: await resolveHome(search.redirect) });
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) throw err;
      const mock = getMockSession();
      if (mock) throw redirect({ to: await resolveHome(search.redirect, mock.roles) });
    }
  },
  head: () => ({ meta: [{ title: `Entrar — ${SITE.name}` }] }),
  component: AuthPage,
});

async function resolveHome(redirectTo?: string, rolesOverride?: string[]) {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) return redirectTo as "/";
  if (rolesOverride) return mockResolveHome(rolesOverride);
  const { roles } = await fetchMyRoles();
  return mockResolveHome(roles);
}

const DEMOS = [
  { email: "admin@bemaqui.com", label: "Administrador", hint: "Painel /admin" },
  { email: "corretor@bemaqui.com", label: "Corretor", hint: "Painel /painel" },
  { email: "cliente@bemaqui.com", label: "Cliente", hint: "Área /conta" },
];

function AuthPage() {
  const { redirect: redirectTo, mode } = Route.useSearch();
  const { mockMode, refreshMockSession } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(mode ?? "login");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [loginEmail, setLoginEmail] = useState("cliente@bemaqui.com");
  const [loginPassword, setLoginPassword] = useState("123456");

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<"client" | "broker">("client");
  const [creci, setCreci] = useState("");
  const [lgpd, setLgpd] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");

  const afterLogin = async (roles?: string[]) => {
    const to = await resolveHome(redirectTo, roles);
    toast.success(mockMode ? "Login demo realizado" : "Login realizado");
    await navigate({ to });
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mockMode || !hasSupabaseEnv()) {
        const session = mockSignIn(loginEmail, loginPassword);
        refreshMockSession();
        setLoading(false);
        await afterLogin(session.roles);
        return;
      }
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
      setLoading(false);
      if (error) {
        // Fallback demo se Supabase rejeitar / estiver offline
        try {
          const session = mockSignIn(loginEmail, loginPassword);
          refreshMockSession();
          await afterLogin(session.roles);
          return;
        } catch {
          toast.error(error.message || "Não foi possível entrar");
          return;
        }
      }
      await afterLogin();
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Não foi possível entrar");
    }
  };

  const fillDemo = (email: string) => {
    setLoginEmail(email);
    setLoginPassword("123456");
    setTab("login");
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpd) {
      toast.error("É necessário aceitar a política de privacidade (LGPD).");
      return;
    }
    if (mockMode || !hasSupabaseEnv()) {
      toast.message("No modo demo, use as contas prontas ao lado (senha 123456).");
      setTab("login");
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            account_type: accountType,
            lgpd_consent: "true",
            creci: accountType === "broker" ? creci.trim() : undefined,
          },
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message || "Não foi possível criar a conta");
        return;
      }
      toast.success(accountType === "broker" ? "Conta criada. Aguarde aprovação para publicar imóveis." : "Conta criada com sucesso");
      await afterLogin();
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Não foi possível criar a conta");
    }
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mockMode || !hasSupabaseEnv()) {
      toast.message("No modo demo a senha das contas é sempre 123456.");
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message || "Não foi possível enviar o e-mail");
        return;
      }
      toast.success("Se o e-mail existir, enviamos o link de redefinição.");
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o e-mail");
    }
  };

  return (
    <SiteShell>
      <section className="bg-navy-gradient py-12 text-navy-foreground">
        <div className="container-page max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Acesso seguro</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Entre na plataforma {SITE.name}</h1>
          <p className="mt-3 max-w-2xl text-navy-foreground/75">Portal do cliente, painel do corretor e administração em um só login.</p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
              <TabsTrigger value="forgot">Senha</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={onLogin} className="space-y-4">
                <Field label="E-mail" htmlFor="login-email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-email" type="email" required className="pl-9" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>
                </Field>
                <Field label="Senha" htmlFor="login-password">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPw ? "text" : "password"}
                      required
                      className="pl-9 pr-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPw((s) => !s)} aria-label="Mostrar senha">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={onSignup} className="space-y-4">
                <Field label="Nome completo" htmlFor="full-name">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="full-name" required className="pl-9" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                </Field>
                <Field label="E-mail" htmlFor="signup-email">
                  <Input id="signup-email" type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                </Field>
                <Field label="Telefone" htmlFor="phone">
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                </Field>
                <Field label="Senha" htmlFor="signup-password">
                  <Input id="signup-password" type="password" required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                </Field>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("client")}
                    className={`rounded-xl border p-3 text-left text-sm ${accountType === "client" ? "border-gold bg-gold/10" : "hover:bg-muted"}`}
                  >
                    <p className="font-semibold">Cliente</p>
                    <p className="text-xs text-muted-foreground">Favoritos e propostas</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("broker")}
                    className={`rounded-xl border p-3 text-left text-sm ${accountType === "broker" ? "border-gold bg-gold/10" : "hover:bg-muted"}`}
                  >
                    <p className="font-semibold">Corretor</p>
                    <p className="text-xs text-muted-foreground">Painel profissional</p>
                  </button>
                </div>
                {accountType === "broker" && (
                  <Field label="CRECI" htmlFor="creci">
                    <Input id="creci" required value={creci} onChange={(e) => setCreci(e.target.value)} placeholder="Ex.: 123456-F" />
                  </Field>
                )}
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={lgpd} onCheckedChange={(v) => setLgpd(v === true)} className="mt-0.5" />
                  <span>
                    Li e aceito a{" "}
                    <Link to="/privacidade" className="font-semibold text-primary underline-offset-2 hover:underline">
                      Política de Privacidade (LGPD)
                    </Link>
                    .
                  </span>
                </label>
                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="forgot" className="mt-6">
              <form onSubmit={onForgot} className="space-y-4">
                <p className="text-sm text-muted-foreground">Informe seu e-mail para receber o link de redefinição.</p>
                <Field label="E-mail" htmlFor="forgot-email">
                  <Input id="forgot-email" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                </Field>
                <Button type="submit" variant="navy" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-navy p-6 text-navy-foreground shadow-soft">
            <div className="flex items-center gap-2 text-gold">
              <Building2 className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Contas demo</p>
            </div>
            <p className="mt-3 text-sm text-navy-foreground/75">
              {mockMode ? "Modo demo (sem Supabase). " : ""}
              Senha de todas: <strong className="text-gold">123456</strong>
            </p>
            <div className="mt-4 space-y-2">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemo(d.email)}
                  className="flex w-full items-center justify-between rounded-xl border border-navy-foreground/15 bg-navy-foreground/5 px-4 py-3 text-left transition hover:border-gold/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">{d.label}</span>
                    <span className="block text-xs text-navy-foreground/65">{d.email}</span>
                  </span>
                  <span className="text-[11px] text-gold">{d.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <p className="font-semibold text-navy">Três interfaces, um login</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Cliente: favoritos, propostas e notificações</li>
              <li>• Corretor: imóveis, leads e negociações</li>
              <li>• Admin: aprovações, usuários e conteúdo</li>
            </ul>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
