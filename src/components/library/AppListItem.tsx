import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InUseApp, AppStatus } from "@/hooks/useInUseApps";
import { AppIcon } from "@/components/icons/AppIcon";

const statusConfig: Record<AppStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25" },
  disable: { label: "Disabled", className: "bg-muted/60 text-muted-foreground border-muted" },
  developing: { label: "Coming Soon", className: "bg-amber-500/15 text-amber-500 border-amber-500/25" },
};

interface AppListItemProps {
  app: InUseApp;
  onOpen: () => void;
  onDetail: () => void;
}

export function AppListItem({ app, onOpen, onDetail }: AppListItemProps) {
  const cfg = statusConfig[app.status];
  const isAvailable = app.status === "available";

  return (
    <div
      onClick={onDetail}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
        isAvailable && "hover:bg-muted/50",
        app.status === "disable" && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Icon */}
      {app.icon_url ? (
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <AppIcon route={app.route} size="sm" className="flex-shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground truncate">{app.name}</h4>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-medium flex-shrink-0", cfg.className)}>
            {cfg.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {app.short_description || "No description"}
        </p>
      </div>

      {/* Action */}
      {isAvailable && (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-3 text-xs text-primary hover:bg-primary/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          Open
        </Button>
      )}
    </div>
  );
}

export function AppListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  );
}
