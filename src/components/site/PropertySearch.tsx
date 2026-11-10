import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PropertyFilters } from "@/lib/public.functions";

type Props = {
  initial?: PropertyFilters;
  categories?: { slug: string; name: string }[];
  compact?: boolean;
  onSubmitPath?: "/imoveis" | "/comprar" | "/alugar";
};

export function PropertySearch({ initial = {}, categories = [], compact, onSubmitPath = "/imoveis" }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial.q ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [purpose, setPurpose] = useState<string>(initial.purpose ?? "all");
  const [category, setCategory] = useState(initial.category ?? "all");
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ? String(initial.bedrooms) : "all");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, string | undefined> = {};
    if (q.trim()) search.q = q.trim();
    if (city.trim()) search.city = city.trim();
    if (purpose !== "all") search.purpose = purpose;
    if (category !== "all") search.category = category;
    if (bedrooms !== "all") search.bedrooms = bedrooms;
    void navigate({ to: onSubmitPath, search });
  };

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "grid gap-3 rounded-2xl border bg-card p-4 shadow-soft md:grid-cols-[1fr_auto]"
          : "grid gap-3 rounded-2xl bg-card/95 p-4 shadow-lift backdrop-blur md:grid-cols-2 lg:grid-cols-6"
      }
    >
      <div className={compact ? "" : "lg:col-span-2"}>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Busca</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Bairro, cidade ou título" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {!compact && (
        <>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cidade</label>
            <Input placeholder="Ex.: São Paulo" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finalidade</label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="venda">Comprar</SelectItem>
                <SelectItem value="aluguel">Alugar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quartos</label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}+</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className={compact ? "flex items-end" : "flex items-end lg:col-span-6"}>
        <Button type="submit" variant="gold" size="lg" className="w-full md:w-auto">
          <Search /> Buscar imóveis
        </Button>
      </div>
    </form>
  );
}
