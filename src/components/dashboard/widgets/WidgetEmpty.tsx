import type { ComponentType } from "react";

/**
 * Phase 4 M5 — shared empty state for Canvas Dashboard widgets. Keeps the
 * "no data yet" presentation consistent across widgets.
 */
export function WidgetEmpty({
  message,
  icon: Icon,
}: {
  message: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground/50" />}
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
