import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
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

interface AppCardLargeProps {
  app: InUseApp;
  onOpen: () => void;
  onDetail: () => void;
}

export function AppCardLarge({ app, onOpen, onDetail }: AppCardLargeProps) {
  const cfg = statusConfig[app.status];
  const isAvailable = app.status === "available";

  return (
    <Card
      onClick={onDetail}
      className={cn(
        "group relative p-5 border-border/40 bg-card/60 backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden",
        isAvailable && "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5",
        app.status === "disable" && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col gap-3">
        {/* Icon + Status */}
        <div className="flex items-start justify-between">
          {app.icon_url ? (
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <AppIcon route={app.route} size="md" className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
          )}
          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 h-5 font-medium", cfg.className)}>
            {cfg.label}
          </Badge>
        </div>

        {/* Name + Description */}
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-sm leading-tight">{app.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {app.short_description || "No description available"}
          </p>
        </div>

        {/* Open Button */}
        {isAvailable && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 opacity-0 group-hover:opacity-100 sm:opacity-100"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open
          </Button>
        )}
      </div>
    </Card>
  );
}

export function AppCardLargeSkeleton() {
  return (
    <Card className="p-5 border-border/40 bg-card/60">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </Card>
  );
}
