import { ExternalLink, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { InUseApp, AppStatus } from "@/hooks/useInUseApps";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Sparkles, Shield, Database, MonitorPlay, Code, Bitcoin, Folder } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<AppStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25" },
  disable: { label: "Disabled", className: "bg-muted/60 text-muted-foreground border-muted" },
  developing: { label: "Coming Soon", className: "bg-amber-500/15 text-amber-500 border-amber-500/25" },
};

const routeIconMap: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/developing/ai": Sparkles,
  "/customization/admin": Shield,
  "/developing/data": Database,
  "/library": MonitorPlay,
  "/workspace/developer": Code,
  "/apps/crypto": Bitcoin,
};

function getIconForRoute(route: string): LucideIcon {
  return routeIconMap[route] || Folder;
}

interface AppDetailModalProps {
  app: InUseApp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: (route: string) => void;
  categoryNames?: string[];
}

function DetailContent({ app, onOpen, categoryNames = [] }: { app: InUseApp; onOpen: (route: string) => void; categoryNames?: string[] }) {
  const cfg = statusConfig[app.status];
  const IconComponent = getIconForRoute(app.route);
  const isAvailable = app.status === "available";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {app.icon_url ? (
            <img src={app.icon_url} alt={app.name} className="w-8 h-8 rounded-xl" />
          ) : (
            <IconComponent className="w-8 h-8 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{app.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{app.short_description || "No description"}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs px-2 py-0.5 font-medium", cfg.className)}>
              {cfg.label}
            </Badge>
            {categoryNames.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs px-2 py-0.5">{name}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Open Button */}
      {isAvailable && (
        <Button
          className="w-full h-10 font-medium"
          onClick={() => onOpen(app.route)}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open App
        </Button>
      )}

      <Separator className="bg-border/50" />

      {/* App Image */}
      {app.app_image_url && (
        <div className="rounded-xl overflow-hidden border border-border/50">
          <img src={app.app_image_url} alt={`${app.name} preview`} className="w-full h-auto" />
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">About this app</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {app.long_description || app.short_description || "No detailed description available."}
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Added {format(new Date(app.created_at), "MMM d, yyyy")}</span>
        </div>
      </div>
    </div>
  );
}

export function AppDetailModal({ app, open, onOpenChange, onOpen, categoryNames }: AppDetailModalProps) {
  const isMobile = useIsMobile();

  if (!app) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-5 pt-6 pb-8 overflow-y-auto">
          <SheetTitle className="sr-only">{app.name}</SheetTitle>
          <DetailContent app={app} onOpen={onOpen} categoryNames={categoryNames} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 gap-0 overflow-y-auto max-h-[85vh]">
        <DialogTitle className="sr-only">{app.name}</DialogTitle>
        <DetailContent app={app} onOpen={onOpen} categoryNames={categoryNames} />
      </DialogContent>
    </Dialog>
  );
}
