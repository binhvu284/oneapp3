import { Suspense, useState } from "react";
import { X, GripVertical, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WIDGET_REGISTRY, WidgetType, ConfigField } from "./widgets/WidgetRegistry";

interface WidgetWrapperProps {
  title: string;
  widgetType: WidgetType;
  isEditing: boolean;
  onRemove?: () => void;
  config?: Record<string, any>;
  onConfigChange?: (c: Record<string, any>) => void;
  children: React.ReactNode;
}

export function WidgetWrapper({ title, widgetType, isEditing, onRemove, config, onConfigChange, children }: WidgetWrapperProps) {
  const def = WIDGET_REGISTRY[widgetType];
  const configFields = def?.configFields;

  return (
    <div className="h-full flex flex-col bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isEditing && (
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0 drag-handle" />
          )}
          <span className="text-xs font-medium text-muted-foreground truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isEditing && configFields && configFields.length > 0 && (
            <WidgetSettingsPopover
              fields={configFields}
              config={config ?? {}}
              onChange={onConfigChange}
            />
          )}
          {isEditing && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <Suspense fallback={<Skeleton className="w-full h-full min-h-[60px]" />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

function WidgetSettingsPopover({
  fields,
  config,
  onChange,
}: {
  fields: ConfigField[];
  config: Record<string, any>;
  onChange?: (c: Record<string, any>) => void;
}) {
  const [local, setLocal] = useState<Record<string, any>>(config);

  const handleChange = (key: string, value: string) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onChange?.(updated);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-sm hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 space-y-3" align="end" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-medium text-foreground">Widget Settings</p>
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-[10px] text-muted-foreground">{field.label}</label>
            {field.type === "select" ? (
              <select
                value={local[field.key] ?? field.options?.[0]?.value ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full text-xs bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={local[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full text-xs bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            )}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
