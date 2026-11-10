import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export type PanelNavItem = { to: string; label: string; exact?: boolean };

export function PanelShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: PanelNavItem[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 p-3" aria-label={title}>
      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to as "/"}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-gold text-gold-foreground" : "text-navy-foreground/80 hover:bg-navy-foreground/10 hover:text-navy-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b bg-navy text-navy-foreground no-print">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-navy-foreground hover:bg-navy-foreground/10" aria-label="Abrir menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-navy p-0 text-navy-foreground border-navy">
                <SheetHeader className="border-b border-navy-foreground/10 px-4 py-4">
                  <SheetTitle className="text-left text-navy-foreground">{title}</SheetTitle>
                </SheetHeader>
                <NavLinks />
              </SheetContent>
            </Sheet>
            <Logo light />
            <span className="hidden rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold sm:inline">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline-light" size="sm" className="hidden sm:inline-flex">
              <Link to="/">Ver site</Link>
            </Button>
            {user && <NotificationBell userId={user.id} light />}
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="container-page grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden h-fit rounded-2xl bg-navy text-navy-foreground shadow-soft lg:block">
          <div className="border-b border-navy-foreground/10 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{title}</p>
          </div>
          <NavLinks />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function PanelStat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
