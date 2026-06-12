/**
 * Phase 4 M6 — Sidebar 3.0 pinnable quick-actions (PRD §6.3 F4.6).
 *
 * Pure catalog + helpers (no React/DOM). The pinned set is persisted as an
 * array of action ids in `user_settings.sidebar_pinned_actions` (jsonb). Icons
 * are referenced by name so this module stays pure and unit-testable; the
 * sidebar component maps `iconName` → a lucide component at render time.
 */

export interface QuickAction {
  id: string;
  label: string;
  url: string;
  iconName: string;
}

/** Maximum number of quick-actions a user can pin to the sidebar. */
export const MAX_PINNED = 3;

/** Catalog of quick-actions each module exposes for pinning. */
export const QUICK_ACTION_CATALOG: QuickAction[] = [
  { id: "new-note", label: "New Note", url: "/apps/onenote", iconName: "FilePlus" },
  { id: "new-chat", label: "New AI Chat", url: "/developing/ai/chat", iconName: "MessageSquarePlus" },
  { id: "translate", label: "Translate", url: "/developing/ai/translate", iconName: "Languages" },
  { id: "crypto", label: "OneCrypto", url: "/apps/crypto", iconName: "Coins" },
  { id: "data", label: "OneApp Data", url: "/developing/data", iconName: "Database" },
];

const CATALOG_BY_ID = new Map(QUICK_ACTION_CATALOG.map((a) => [a.id, a]));

/**
 * Toggles an action id in the pinned list: removes it if present, otherwise
 * appends it — but never beyond {@link MAX_PINNED}. Returns a new array.
 */
export function togglePinned(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  if (ids.length >= MAX_PINNED) return ids; // at capacity — no-op
  return [...ids, id];
}

/**
 * Resolves an array of pinned ids to catalog entries, preserving order and
 * dropping any id that is not (or is no longer) in the catalog.
 */
export function resolvePinnedActions(ids: string[]): QuickAction[] {
  return ids.map((id) => CATALOG_BY_ID.get(id)).filter((a): a is QuickAction => a !== undefined);
}

/** Narrows unknown jsonb into a clean string[] of action ids. */
export function parsePinnedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && CATALOG_BY_ID.has(v));
}
