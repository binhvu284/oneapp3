import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { InUseApp } from "@/hooks/useInUseApps";
import { AppIcon } from "@/components/icons/AppIcon";

interface FeaturedAppCardProps {
  app: InUseApp;
  onOpen: () => void;
  onDetail: () => void;
}

export function FeaturedAppCard({ app, onOpen, onDetail }: FeaturedAppCardProps) {
  return (
    <div
      onClick={onDetail}
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
        {/* Icon */}
        {app.icon_url ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <AppIcon route={app.route} size="lg" className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-1">Featured</p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{app.name}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {app.short_description || "Explore this app"}
          </p>
          <Button
            size="sm"
            className="h-9 px-5 text-xs font-semibold gap-1.5"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open App
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedAppCardSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-muted/30 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-xs" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}
