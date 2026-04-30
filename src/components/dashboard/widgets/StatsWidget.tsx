import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { Layers, MessageSquare, Coins } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>();

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = 0;
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);

  return <span>{display}</span>;
}

export default function StatsWidget() {
  const { user } = useAuthSafe();
  const [stats, setStats] = useState({ apps: 0, conversations: 0, holdings: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [appsRes, convoRes, holdRes] = await Promise.all([
        supabase.from("in_use_apps").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("crypto_holdings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({
        apps: appsRes.count ?? 0,
        conversations: convoRes.count ?? 0,
        holdings: holdRes.count ?? 0,
      });
    };
    load();
  }, [user]);

  const items = [
    { icon: Layers, label: "Apps", value: stats.apps, color: "text-primary" },
    { icon: MessageSquare, label: "Chats", value: stats.conversations, color: "text-primary" },
    { icon: Coins, label: "Holdings", value: stats.holdings, color: "text-primary" },
  ];

  return (
    <div className="flex items-center justify-around h-full">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1">
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <span className="text-lg font-bold text-foreground tabular-nums">
            <AnimatedNumber value={item.value} />
          </span>
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
