import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DemoBadge } from "@/components/site/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { pickMockAvatar } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type BrokerSlide = {
  id: string;
  display_name: string | null;
  creci?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  city?: string | null;
  specialties?: string[] | null;
  is_demo?: boolean | null;
  agency?: { name?: string } | null;
};

function photoOf(b: BrokerSlide, index: number) {
  const url = b.photo_url?.trim();
  if (url && !url.includes("__l5e") && (url.startsWith("http") || url.startsWith("//"))) return url;
  return pickMockAvatar(index + (b.id?.length ?? 0));
}

export function BrokerCard({ broker, index = 0, className }: { broker: BrokerSlide; index?: number; className?: string }) {
  const [src, setSrc] = useState(photoOf(broker, index));
  return (
    <Link
      to="/corretor/$id"
      params={{ id: broker.id }}
      className={cn("block h-full rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <Avatar className="h-16 w-16 border-2 border-gold">
          <AvatarImage src={src} alt={broker.display_name ?? "Corretor"} onError={() => setSrc(pickMockAvatar(index + 3))} />
          <AvatarFallback className="bg-navy text-lg font-bold text-gold">
            {(broker.display_name ?? "?").slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        {broker.is_demo && <DemoBadge />}
      </div>
      <p className="mt-4 font-semibold text-navy">{broker.display_name}</p>
      <p className="text-xs text-muted-foreground">
        CRECI {broker.creci ?? "—"}
        {broker.city ? ` · ${broker.city}` : ""}
        {broker.agency?.name ? ` · ${broker.agency.name}` : ""}
      </p>
      {broker.bio && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{broker.bio}</p>}
      {Array.isArray(broker.specialties) && broker.specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {broker.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export function BrokerCarousel({ brokers, autoPlayMs = 3500 }: { brokers: BrokerSlide[]; autoPlayMs?: number }) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || brokers.length < 2) return;
    const id = window.setInterval(() => {
      if (!api.canScrollNext()) api.scrollTo(0);
      else api.scrollNext();
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [api, autoPlayMs, brokers.length]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: true }}
      className="w-full"
    >
      <CarouselContent className="-ml-3">
        {brokers.map((b, i) => (
          <CarouselItem key={b.id} className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <BrokerCard broker={b} index={i} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 border-navy/20 bg-background/95 text-navy shadow-soft disabled:opacity-40 md:-left-4" />
      <CarouselNext className="right-0 border-navy/20 bg-background/95 text-navy shadow-soft disabled:opacity-40 md:-right-4" />
    </Carousel>
  );
}

export function TestimonialCarousel({
  items,
  autoPlayMs = 4200,
}: {
  items: Array<{
    id: string;
    author_name: string;
    author_role?: string | null;
    content: string;
    photo_url?: string | null;
  }>;
  autoPlayMs?: number;
}) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api || items.length < 2) return;
    const id = window.setInterval(() => {
      if (!api.canScrollNext()) api.scrollTo(0);
      else api.scrollNext();
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [api, autoPlayMs, items.length]);

  return (
    <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-3">
        {items.map((t, i) => {
          const photo = t.photo_url && t.photo_url.startsWith("http") ? t.photo_url : pickMockAvatar(i + 4);
          return (
            <CarouselItem key={t.id} className="pl-3 basis-[90%] sm:basis-1/2 lg:basis-1/3">
              <blockquote className="h-full rounded-2xl border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-gold/40">
                    <AvatarImage src={photo} alt={t.author_name} />
                    <AvatarFallback className="bg-navy text-gold">{t.author_name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-navy">{t.author_name}</p>
                    {t.author_role && <p className="text-xs text-muted-foreground">{t.author_role}</p>}
                  </div>
                </div>
                <p className="mt-4 text-sm text-foreground/90">“{t.content}”</p>
              </blockquote>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-0 border-navy/20 bg-background/95 text-navy shadow-soft md:-left-4" />
      <CarouselNext className="right-0 border-navy/20 bg-background/95 text-navy shadow-soft md:-right-4" />
    </Carousel>
  );
}
