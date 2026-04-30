import { Pencil, PencilOff, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface DashboardToolbarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onAddWidget: () => void;
  onReset: () => void;
}

export function DashboardToolbar({ isEditing, onToggleEdit, onAddWidget, onReset }: DashboardToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Your personal workspace</p>
      </div>
      <div className="flex items-center gap-2">
        {isEditing && (
          <>
            <Button variant="outline" size="sm" onClick={onAddWidget} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add Widget
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-xs text-muted-foreground">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </>
        )}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
          {isEditing ? (
            <PencilOff className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <Switch checked={isEditing} onCheckedChange={onToggleEdit} />
        </div>
      </div>
    </div>
  );
}
