import { ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AppCardSmall, AppCardSmallSkeleton } from "./AppCardSmall";
import type { InUseApp } from "@/hooks/useInUseApps";

interface CategoryRowProps {
  name: string;
  color?: string | null;
  apps: InUseApp[];
  onAppClick: (app: InUseApp) => void;
}

export function CategoryRow({ name, color, apps, onAppClick }: CategoryRowProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color || "hsl(var(--primary))" }} />
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <span className="text-xs text-muted-foreground">({apps.length})</span>
      </div>

      {/* Horizontal scroll */}
      {apps.length > 0 ? (
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-2">
            {apps.map((app) => (
              <AppCardSmall key={app.id} app={app} onClick={() => onAppClick(app)} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <p className="text-xs text-muted-foreground pl-5 py-3">No apps in this category</p>
      )}
    </div>
  );
}

export function CategoryRowSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <AppCardSmallSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
