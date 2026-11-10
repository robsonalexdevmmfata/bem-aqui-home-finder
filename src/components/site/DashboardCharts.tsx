import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  deltaUp = true,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  delta?: string;
  deltaUp?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <span className="rounded-xl bg-navy/5 p-2 text-navy">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-navy">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {delta && (
          <span className={cn("inline-flex items-center gap-1 font-semibold", deltaUp ? "text-success" : "text-destructive")}>
            {deltaUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-navy">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ActivityList({
  items,
}: {
  items: readonly { time?: string; text?: string; title?: string; status?: string; price?: string }[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-navy">{item.text ?? item.title}</p>
            {(item.time || item.status) && (
              <p className="mt-0.5 text-xs text-muted-foreground">{item.time ?? item.status}</p>
            )}
          </div>
          {item.price && <span className="shrink-0 text-xs font-semibold text-gold">{item.price}</span>}
        </li>
      ))}
    </ul>
  );
}

export function TrafficAreaChart({
  data,
}: {
  data: readonly { month: string; visits: number; leads: number }[];
}) {
  const config = {
    visits: { label: "Visitas", color: "var(--chart-1)" },
    leads: { label: "Leads", color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <AreaChart data={[...data]} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="visits" stroke="var(--color-visits)" fill="url(#fillVisits)" strokeWidth={2} />
        <Area type="monotone" dataKey="leads" stroke="var(--color-leads)" fill="url(#fillLeads)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}

export function StatusBarChart({
  data,
  dataKey = "value",
  nameKey = "name",
  color = "var(--chart-1)",
}: {
  data: readonly Record<string, string | number>[];
  dataKey?: string;
  nameKey?: string;
  color?: string;
}) {
  const config = {
    [dataKey]: { label: "Total", color },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <BarChart data={[...data]} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

export function DualLineChart({
  data,
}: {
  data: readonly { week: string; leads: number; proposals: number; views: number }[];
}) {
  const config = {
    leads: { label: "Leads", color: "var(--chart-2)" },
    proposals: { label: "Propostas", color: "var(--chart-1)" },
    views: { label: "Views", color: "var(--chart-3)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <LineChart data={[...data]} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="proposals" stroke="var(--color-proposals)" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ChartContainer>
  );
}

export function DonutChart({ data }: { data: readonly { name: string; value: number }[] }) {
  const config: ChartConfig = {};
  data.forEach((d, i) => {
    config[d.name] = { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length]! };
  });

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-[240px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
        <Pie data={[...data]} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}

export function ClientActivityChart({
  data,
}: {
  data: readonly { month: string; views: number; favorites: number; proposals: number }[];
}) {
  const config = {
    views: { label: "Visualizações", color: "var(--chart-1)" },
    favorites: { label: "Favoritos", color: "var(--chart-2)" },
    proposals: { label: "Propostas", color: "var(--chart-4)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <AreaChart data={[...data]} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillClientViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="url(#fillClientViews)" strokeWidth={2} />
        <Area type="monotone" dataKey="favorites" stroke="var(--color-favorites)" fill="transparent" strokeWidth={2} />
        <Area type="monotone" dataKey="proposals" stroke="var(--color-proposals)" fill="transparent" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
