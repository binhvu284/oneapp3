import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";

export type ActivityKind =
  | "note_saved"
  | "note_created"
  | "task_completed"
  | "deploy_triggered"
  | "deploy_succeeded"
  | "deploy_failed"
  | "query_run"
  | "ai_message"
  | "system";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  message: string;
  href?: string;
  createdAt: number;
}

interface ActivityFeedContextValue {
  events: ActivityEvent[];
  push: (event: Omit<ActivityEvent, "id" | "createdAt">) => void;
  clear: () => void;
}

const MAX_EVENTS = 5;

const ActivityFeedContext = createContext<ActivityFeedContextValue | undefined>(
  undefined,
);

export function ActivityFeedProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  const push = useCallback(
    (event: Omit<ActivityEvent, "id" | "createdAt">) => {
      setEvents((prev) =>
        [
          {
            ...event,
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: Date.now(),
          },
          ...prev,
        ].slice(0, MAX_EVENTS),
      );
    },
    [],
  );

  const clear = useCallback(() => setEvents([]), []);

  const value = useMemo(() => ({ events, push, clear }), [events, push, clear]);

  return (
    <ActivityFeedContext.Provider value={value}>
      {children}
    </ActivityFeedContext.Provider>
  );
}

export function useActivityFeed() {
  const ctx = useContext(ActivityFeedContext);
  if (!ctx) {
    throw new Error(
      "useActivityFeed must be used within an ActivityFeedProvider",
    );
  }
  return ctx;
}
