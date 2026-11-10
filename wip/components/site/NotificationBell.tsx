import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationBell({ userId, light }: { userId: string; light?: boolean }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15);
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`notif-${userId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
        qc.invalidateQueries({ queryKey: ["notifications", userId] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  const unread = data.filter((n) => !n.read_at).length;
  const markAll = async () => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null);
    qc.invalidateQueries({ queryKey: ["notifications", userId] });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", light && "text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground")} aria-label="Notificações">
          <Bell />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notificações</p>
          {unread > 0 && (
            <button onClick={markAll} className="text-xs font-medium text-primary hover:underline">
              Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {data.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>}
          {data.map((n) => (
            <Link
              key={n.id}
              to={(n.link ?? "/conta") as "/conta"}
              onClick={async () => {
                if (!n.read_at) {
                  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
                  qc.invalidateQueries({ queryKey: ["notifications", userId] });
                }
              }}
              className={cn("block border-b px-4 py-3 text-sm last:border-0 hover:bg-muted", !n.read_at && "bg-accent/40")}
            >
              <p className="font-semibold text-foreground">{n.title}</p>
              {n.body && <p className="mt-0.5 line-clamp-2 text-muted-foreground">{n.body}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(n.created_at)}</p>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
