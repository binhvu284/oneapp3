import { useCallback, useEffect, useState } from "react";

export interface PinnedAction {
  id: string;
  label: string;
  iconName: string;
  url?: string;
  /** Optional callback id consumers can listen for via window event */
  command?: string;
}

const STORAGE_KEY = "oneapp-sidebar-pinned-actions";
const MAX_PINS = 5;

const defaultPins: PinnedAction[] = [
  {
    id: "new-note",
    label: "New Note",
    iconName: "FilePlus",
    url: "/apps/onenote?new=1",
  },
  {
    id: "command-palette",
    label: "Command Palette",
    iconName: "Command",
    command: "open-command-palette",
  },
  {
    id: "ai-chat",
    label: "Ask AI",
    iconName: "Sparkles",
    url: "/developing/ai/chat",
  },
];

function load(): PinnedAction[] {
  if (typeof window === "undefined") return defaultPins;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPins;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultPins;
    return parsed.slice(0, MAX_PINS);
  } catch {
    return defaultPins;
  }
}

export function usePinnedActions() {
  const [actions, setActions] = useState<PinnedAction[]>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    } catch {
      /* storage may be disabled */
    }
  }, [actions]);

  const addAction = useCallback((action: PinnedAction) => {
    setActions((prev) => {
      if (prev.some((a) => a.id === action.id)) return prev;
      if (prev.length >= MAX_PINS) return prev;
      return [...prev, action];
    });
  }, []);

  const removeAction = useCallback((id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const reset = useCallback(() => setActions(defaultPins), []);

  return { actions, addAction, removeAction, reset, max: MAX_PINS };
}
