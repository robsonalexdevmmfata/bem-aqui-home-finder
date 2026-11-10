import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="10" className="fill-navy" />
      <path d="M8 20 L20 9 L32 20" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-gold" />
      <path d="M20 15c-3.6 0-6.5 2.8-6.5 6.3 0 4.6 6.5 10.7 6.5 10.7s6.5-6.1 6.5-10.7c0-3.5-2.9-6.3-6.5-6.3z" className="fill-gold" />
      <circle cx="20" cy="21.3" r="2.4" className="fill-navy" />
    </svg>
  );
}

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="BEM AQUI IMÓVEIS — página inicial">
      <LogoMark />
      <span className="leading-none">
        <span className={cn("block font-display text-[17px] font-bold tracking-tight", light ? "text-navy-foreground" : "text-navy")}>
          BEM AQUI
        </span>
        <span className="block text-[10px] font-semibold tracking-[0.32em] text-gold">IMÓVEIS</span>
      </span>
    </Link>
  );
}
