import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { WIDGET_REGISTRY, WidgetType, DashboardWidget } from "./widgets/WidgetRegistry";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingWidgets: DashboardWidget[];
  onAdd: (type: WidgetType) => void;
}

export function AddWidgetDialog({ open, onOpenChange, onAdd }: AddWidgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Add Widget</DialogTitle>
          <DialogDescription className="text-xs">Choose a widget to add to your dashboard</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-[60vh] overflow-auto">
          {Object.values(WIDGET_REGISTRY).map((def) => {
            const Icon = def.icon;
            return (
              <button
                key={def.type}
                onClick={() => {
                  onAdd(def.type);
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors text-left"
              >
                <div className="p-2 rounded-md bg-primary/10 shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{def.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{def.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
