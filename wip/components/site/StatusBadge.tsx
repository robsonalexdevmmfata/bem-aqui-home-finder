import { Badge } from "@/components/ui/badge";

const toneToVariant = { muted: "muted", warning: "warning", success: "success", destructive: "danger", brand: "brand" } as const;

export function StatusBadge({ map, value }: { map: Record<string, { label: string; tone: keyof typeof toneToVariant }>; value: string }) {
  const s = map[value] ?? { label: value, tone: "muted" as const };
  return <Badge variant={toneToVariant[s.tone]}>{s.label}</Badge>;
}

export function DemoBadge({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return (
    <Badge variant="outline" className="border-dashed text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      Dados fictícios
    </Badge>
  );
}
