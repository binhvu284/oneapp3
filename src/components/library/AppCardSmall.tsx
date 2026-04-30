import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InUseApp, AppStatus } from "@/hooks/useInUseApps";
import { AppIcon } from "@/components/icons/AppIcon";

const statusConfig: Record<AppStatus, { label: string; dotClass: string }> = {
  available: { label: "Available", dotClass: "bg-emerald-500" },
  disable: { label: "Disabled", dotClass: "bg-muted-foreground" },
  developing: { label: "Coming Soon", dotClass: "bg-amber-500" },
};

interface AppCardSmallProps {
  app: InUseApp;
  onClick: () => void;
}

export function AppCardSmall({ app, onClick }: AppCardSmallProps) {
  const cfg = statusConfig[app.status];
  const isAvailable = app.status === "available";

  return (
    <button
      onClick={isAvailable ? onClick : undefined}
      disabled={app.status === "disable"}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 min-w-[88px] max-w-[100px] text-center",
        isAvailable && "hover:bg-muted/60 cursor-pointer",
        app.status === "disable" && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className="relative">
        {app.icon_url ? (
          <div className="w-14 h-14 rounded-2xl overflow-hidden">
            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <AppIcon route={app.route} size="lg" />
        )}
        <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background", cfg.dotClass)} />
      </div>
      <span className="text-[11px] font-medium text-foreground leading-tight line-clamp-2">{app.name}</span>
    </button>
  );
}

export function AppCardSmallSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-3 min-w-[88px]">
      <Skeleton className="w-14 h-14 rounded-2xl" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}
