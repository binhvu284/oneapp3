import { useCallback, useMemo, useState } from "react";
import { Responsive, WidthProvider, Layouts, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import {
  WIDGET_REGISTRY, WidgetType, DashboardWidget, DashboardSettings,
} from "./widgets/WidgetRegistry";
import { WidgetWrapper } from "./WidgetWrapper";
import { DashboardToolbar } from "./DashboardToolbar";
import { AddWidgetDialog } from "./AddWidgetDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMicroInteractions } from "@/hooks/useMicroInteractions";
import { cn } from "@/lib/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4 };

export function DashboardGrid() {
  const { settings, isLoading, updateSettings, resetToDefault } = useDashboardSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const motionOn = useMicroInteractions();

  const onLayoutChange = useCallback(
    (_: Layout[], allLayouts: Layouts) => {
      if (!isEditing) return;
      updateSettings({
        ...settings,
        layouts: {
          lg: allLayouts.lg || settings.layouts.lg,
          md: allLayouts.md || settings.layouts.md,
          sm: allLayouts.sm || settings.layouts.sm,
          xs: allLayouts.xs || settings.layouts.xs,
        },
      });
    },
    [isEditing, settings, updateSettings]
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      const newWidgets = settings.widgets.filter((w) => w.id !== widgetId);
      const newLayouts = Object.fromEntries(
        Object.entries(settings.layouts).map(([bp, items]) => [
          bp,
          (items as Layout[]).filter((l) => l.i !== widgetId),
        ])
      ) as DashboardSettings["layouts"];
      updateSettings({ layouts: newLayouts, widgets: newWidgets });
    },
    [settings, updateSettings]
  );

  const addWidget = useCallback(
    (type: WidgetType) => {
      const def = WIDGET_REGISTRY[type];
      const id = `${type}-${Date.now()}`;
      const newWidget: DashboardWidget = { id, type, title: def.label };
      const newLayoutItem = { i: id, x: 0, y: Infinity, ...def.defaultSize };
      const newLayouts = Object.fromEntries(
        Object.entries(settings.layouts).map(([bp, items]) => [
          bp,
          [...(items as Layout[]), newLayoutItem],
        ])
      ) as DashboardSettings["layouts"];
      updateSettings({
        layouts: newLayouts,
        widgets: [...settings.widgets, newWidget],
      });
    },
    [settings, updateSettings]
  );

  const updateWidgetConfig = useCallback(
    (widgetId: string, config: Record<string, any>) => {
      const newWidgets = settings.widgets.map((w) =>
        w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
      );
      updateSettings({ ...settings, widgets: newWidgets });
    },
    [settings, updateSettings]
  );

  const layouts = useMemo<Layouts>(() => {
    if (isEditing) return settings.layouts;
    return Object.fromEntries(
      Object.entries(settings.layouts).map(([bp, items]) => [
        bp,
        (items as Layout[]).map((l) => ({ ...l, static: true })),
      ])
    );
  }, [settings.layouts, isEditing]);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DashboardToolbar
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing((p) => !p)}
        onAddWidget={() => setAddDialogOpen(true)}
        onReset={resetToDefault}
      />

      <div
        className={`transition-all duration-300 rounded-lg ${isEditing ? "ring-1 ring-dashed ring-border/30 p-1 bg-muted/5" : ""
          }`}
      >
        <ResponsiveGridLayout
          className={cn("layout", motionOn && "dashboard-spring")}
          layouts={layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={80}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditing && !isMobile}
          isResizable={isEditing && !isMobile}
          draggableHandle=".drag-handle"
          useCSSTransforms
          compactType="vertical"
        >
          {settings.widgets.map((widget) => {
            const def = WIDGET_REGISTRY[widget.type];
            if (!def) return null;
            const Comp = def.component;
            return (
              <div key={widget.id}>
                {/* Inner wrapper carries the entrance animation so it never fights
                    react-grid-layout's positioning transform on the grid item. */}
                <div className={cn("h-full", motionOn && "animate-widget-drop")}>
                  <WidgetWrapper
                    title={widget.title}
                    widgetType={widget.type}
                    isEditing={isEditing}
                    onRemove={() => removeWidget(widget.id)}
                    config={widget.config}
                    onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
                  >
                    <Comp
                      config={widget.config}
                      onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
                    />
                  </WidgetWrapper>
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      <AddWidgetDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        existingWidgets={settings.widgets}
        onAdd={addWidget}
      />
    </div>
  );
}
