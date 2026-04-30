import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { MessageSquare, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: "conversation" | "session";
}

export default function RecentActivityWidget() {
  const { user } = useAuthSafe();
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, title, agent_name, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      const activities: ActivityItem[] = (convos ?? []).map((c) => ({
        id: c.id,
        text: c.title || `Chat with ${c.agent_name}`,
        time: c.updated_at,
        type: "conversation",
      }));
      setItems(activities);
    };
    load();
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Activity className="w-6 h-6" />
        <p className="text-xs">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full overflow-auto">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 px-1">
          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs text-foreground truncate flex-1">{item.text}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
