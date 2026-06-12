import { FilePlus, MessageSquarePlus, Languages, Coins, Database, Pin, Plus, Check } from "lucide-react";
import type { ComponentType } from "react";
import { NavLink } from "@/components/NavLink";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSidebarPinnedActions } from "@/hooks/useSidebarPinnedActions";
import { QUICK_ACTION_CATALOG, MAX_PINNED } from "@/lib/sidebar-actions";

/** Maps catalog `iconName` → lucide component (keeps the catalog lib pure). */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  FilePlus,
  MessageSquarePlus,
  Languages,
  Coins,
  Database,
};

/**
 * Phase 4 M6 — Sidebar 3.0 pinned quick-actions. Renders the user's pinned
 * actions as nav links plus a manage-popover to pin/unpin (max 3). Gated by the
 * caller on FF_SIDEBAR_3.
 */
export function SidebarPinnedActions({ collapsed }: { collapsed: boolean }) {
  const { pinned, pinnedIds, isPinned, togglePin } = useSidebarPinnedActions(true);

  // Collapsed rail: show only pinned icons, no header/manage UI.
  if (collapsed) {
    if (pinned.length === 0) return null;
    return (
      <div className="mb-2 space-y-1 px-2">
        {pinned.map((action) => {
          const Icon = ICONS[action.iconName] ?? Pin;
          return (
            <NavLink
              key={action.id}
              to={action.url}
              className="nav-item justify-center px-2"
              activeClassName="nav-item-active"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
            </NavLink>
          );
        })}
      </div>
    );
  }

  const atCapacity = pinnedIds.length >= MAX_PINNED;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground">
        <span className="flex items-center gap-1.5">
          <Pin className="h-3 w-3" />
          Pinned
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="rounded-sm p-0.5 text-sidebar-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              aria-label="Manage pinned actions"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <p className="px-1 pb-1 text-xs font-medium text-foreground">
              Pin actions <span className="text-muted-foreground">({pinnedIds.length}/{MAX_PINNED})</span>
            </p>
            <div className="space-y-0.5">
              {QUICK_ACTION_CATALOG.map((action) => {
                const Icon = ICONS[action.iconName] ?? Pin;
                const active = isPinned(action.id);
                const disabled = !active && atCapacity;
                return (
                  <button
                    key={action.id}
                    onClick={() => togglePin(action.id)}
                    disabled={disabled}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-foreground transition-colors",
                      disabled ? "cursor-not-allowed opacity-40" : "hover:bg-accent/10",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-left">{action.label}</span>
                    {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {pinned.length > 0 && (
        <div className="space-y-1 px-2">
          {pinned.map((action) => {
            const Icon = ICONS[action.iconName] ?? Pin;
            return (
              <NavLink
                key={action.id}
                to={action.url}
                className="nav-item"
                activeClassName="nav-item-active"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{action.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
