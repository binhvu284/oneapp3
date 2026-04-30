import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { Grid3X3 } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";

interface AppItem {
  id: string;
  name: string;
  route: string;
  icon_url: string | null;
}

export default function AppShortcutsWidget() {
  const { user } = useAuthSafe();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppItem[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("in_use_apps")
      .select("id, name, route, icon_url")
      .eq("user_id", user.id)
      .eq("status", "available")
      .order("sort_order")
      .limit(8)
      .then(({ data }) => {
        if (data) setApps(data);
      });
  }, [user]);

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Grid3X3 className="w-6 h-6" />
        <p className="text-xs">No apps added yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 h-full content-start">
      {apps.map((app) => (
        <button
          key={app.id}
          onClick={() => navigate(app.route)}
          className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent/10 transition-colors"
        >
          {app.icon_url ? (
            <img src={app.icon_url} alt={app.name} className="w-8 h-8 rounded-md object-cover" />
          ) : (
            <AppIcon route={app.route} size="sm" />
          )}
          <span className="text-[10px] text-muted-foreground truncate w-full text-center">{app.name}</span>
        </button>
      ))}
    </div>
  );
}
