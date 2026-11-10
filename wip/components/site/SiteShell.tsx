import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function SiteShell({ children, transparentHeader = false }: { children: ReactNode; transparentHeader?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader transparent={transparentHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="bg-navy-gradient text-navy-foreground">
      <div className="container-page py-12 lg:py-16">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="gold-rule mt-4" />
        {subtitle && <p className="mt-4 max-w-2xl text-navy-foreground/75">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
