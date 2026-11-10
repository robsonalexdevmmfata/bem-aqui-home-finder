import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, ShieldCheck, User as UserIcon, Heart, Handshake } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABEL } from "@/lib/format";

export function initials(name: string | null | undefined) {
  return (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function UserMenu() {
  const { profile, user, isAdmin, isPro, roles, signOut } = useAuth();
  const name = profile?.full_name || user?.email || "Conta";
  const mainRole = isAdmin ? "admin" : roles.includes("agency") ? "agency" : roles.includes("broker") ? "broker" : "client";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Menu da conta">
        <Avatar className="h-9 w-9 border-2 border-gold">
          <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">{initials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs font-normal text-muted-foreground">{ROLE_LABEL[mainRole]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/conta"><UserIcon /> Minha conta</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/conta/favoritos"><Heart /> Favoritos</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/conta/propostas"><Handshake /> Minhas propostas</Link></DropdownMenuItem>
        {isPro && <DropdownMenuItem asChild><Link to="/painel"><LayoutDashboard /> Painel profissional</Link></DropdownMenuItem>}
        {isAdmin && <DropdownMenuItem asChild><Link to="/admin"><ShieldCheck /> Painel administrativo</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}><LogOut /> Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
