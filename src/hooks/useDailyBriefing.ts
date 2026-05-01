import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { FF_DAILY_BRIEFING } from "@/lib/feature-flags";

interface BriefingNote {
  id: string;
  title: string;
  content: string;
  note_date: string | null;
  updated_at: string;
}

const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-briefing`;

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Fetches today's daily briefing, generating one server-side if it doesn't
 * exist yet. Triggers at most once per browser tab per day, gated by both the
 * `FF_DAILY_BRIEFING` flag and a localStorage marker.
 */
export function useDailyBriefing() {
  const { user, oneappToken } = useAuth();
  const today = todayDateString();
  const storageKey = user ? `briefing:${user.id}:${today}` : null;

  const query = useQuery<BriefingNote | null>({
    queryKey: ["daily_briefing", user?.id, today],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, note_date, updated_at")
        .eq("user_id", user.id)
        .eq("note_type", "daily_briefing")
        .eq("note_date", today)
        .maybeSingle();
      if (error) throw error;
      return (data as BriefingNote | null) ?? null;
    },
    enabled: !!user && FF_DAILY_BRIEFING,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!FF_DAILY_BRIEFING || !user || !oneappToken || !storageKey) return;
    if (query.data) return;
    if (query.isLoading) return;
    if (typeof window !== "undefined" && window.localStorage.getItem(storageKey)) return;

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${oneappToken}`, "Content-Type": "application/json" },
        });
        if (!resp.ok) return;
        if (cancelled) return;
        if (typeof window !== "undefined") window.localStorage.setItem(storageKey, "1");
        await query.refetch();
      } catch {
        /* swallow — surfacing happens via query state */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, oneappToken, query, storageKey]);

  return query;
}
