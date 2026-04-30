import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InUseApp } from "@/hooks/useInUseApps";
import { AppIcon } from "@/components/icons/AppIcon";

interface QuickAccessRowProps {
  apps: InUseApp[];
  onOpen: (route: string) => void;
}

export function QuickAccessRow({ apps, onOpen }: QuickAccessRowProps) {
  if (apps.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {apps.map((app) => {
        return (
          <button
            key={app.id}
            onClick={() => onOpen(app.route)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[72px] py-2 px-1 rounded-xl transition-all duration-200",
              "hover:bg-muted/50 active:scale-95 group"
            )}
          >
            {app.icon_url ? (
              <div className="w-14 h-14 rounded-2xl overflow-hidden">
                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <AppIcon route={app.route} size="lg" />
            )}
            <span className="text-[11px] text-muted-foreground font-medium text-center leading-tight line-clamp-1 max-w-[72px]">
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function QuickAccessRowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
