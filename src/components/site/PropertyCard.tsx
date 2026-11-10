import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Car, Maximize2, MapPin } from "lucide-react";
import type { PropertyCardData } from "@/lib/public.functions";
import { priceLabel, PURPOSE_LABEL } from "@/lib/format";
import { resolvePropertyImageUrl } from "@/lib/property-images";
import { pickMockPhoto } from "@/lib/mock-data";
import { DemoBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function coverUrl(p: PropertyCardData) {
  const imgs = [...(p.images ?? [])].sort((a, b) => a.position - b.position);
  const raw = imgs[0]?.url ?? null;
  return resolvePropertyImageUrl(raw, p.id.length);
}

export function PropertyCard({ property, className }: { property: PropertyCardData; className?: string }) {
  const initial = coverUrl(property);
  const [src, setSrc] = useState(initial);
  const place = [property.neighborhood, property.city].filter(Boolean).join(", ");

  return (
    <Link
      to="/imovel/$slug"
      params={{ slug: property.slug }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={src}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setSrc(pickMockPhoto(property.id.length + 3))}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="gold">{PURPOSE_LABEL[property.purpose] ?? property.purpose}</Badge>
          {property.featured && <Badge className="border-transparent bg-navy text-navy-foreground">Destaque</Badge>}
          {property.is_investment && <Badge variant="brand">Investimento</Badge>}
        </div>
        {property.is_demo && (
          <div className="absolute bottom-3 left-3">
            <DemoBadge />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-display text-lg font-bold text-navy">{priceLabel(property.price, property.purpose)}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{property.title}</h3>
          {place && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-gold" /> {place}
            </p>
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
            </span>
          )}
          {property.parking_spots > 0 && (
            <span className="inline-flex items-center gap-1">
              <Car className="h-3.5 w-3.5" /> {property.parking_spots}
            </span>
          )}
          {property.area_m2 != null && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" /> {property.area_m2} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PropertyGrid({ items }: { items: PropertyCardData[] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-surface px-6 py-16 text-center">
        <p className="font-semibold text-foreground">Nenhum imóvel encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou tente outra busca.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
