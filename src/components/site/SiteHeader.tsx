import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Início" },
  { to: "/comprar", label: "Comprar" },
  { to: "/alugar", label: "Alugar" },
  { to: "/anunciar", label: "Anunciar" },
  { to: "/investir", label: "Investir" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!transparent) return;
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [transparent]);
  const light = transparent && !scrolled;

  return (
    <header
      className={cn(
        "z-40 w-full transition-colors duration-300 no-print",
        transparent ? "fixed top-0" : "sticky top-0",
        light ? "bg-transparent" : "border-b bg-background/95 backdrop-blur",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Logo light={light} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                light ? "text-navy-foreground/85 hover:text-gold" : "text-foreground/75 hover:text-primary",
              )}
              activeProps={{ className: light ? "!text-gold" : "!text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell userId={user.id} light={light} />
              <UserMenu />
            </>
          ) : (
            <>
              <Button asChild variant={light ? "outline-light" : "ghost"} size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
                <Link to="/anunciar">Anunciar imóvel</Link>
              </Button>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("lg:hidden", light && "text-navy-foreground hover:bg-navy-foreground/10")} aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader><SheetTitle className="text-left">Menu</SheetTitle></SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 px-4" aria-label="Menu móvel">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-semibold hover:bg-muted" activeOptions={{ exact: n.to === "/" }} activeProps={{ className: "text-primary bg-muted" }}>
                    {n.label}
                  </Link>
                ))}
                <Link to="/imoveis" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-semibold hover:bg-muted">Todos os imóveis</Link>
                <Link to="/corretores" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-base font-semibold hover:bg-muted">Corretores</Link>
                {!user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button asChild variant="outline"><Link to="/auth" onClick={() => setOpen(false)}>Entrar</Link></Button>
                    <Button asChild variant="gold"><Link to="/anunciar" onClick={() => setOpen(false)}>Anunciar imóvel</Link></Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
