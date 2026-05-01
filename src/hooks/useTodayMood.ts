import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { FF_MOOD_ROUTING } from "@/lib/feature-flags";

export type EnergyLevel = "low" | "deep" | null;

interface MoodResult {
  energy: number | null;
  level: EnergyLevel;
}

/**
 * Reads today's most recent `mood_energy` block from the user's notes and
 * derives a high-level energy bucket used for task routing:
 *  - energy ≤ 2 → "low"
 *  - energy ≥ 4 → "deep"
 *  - otherwise null (no preference)
 */
export function useTodayMood() {
  const { user } = useAuth();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfDay = startOfDay + 86400000;

  return useQuery<MoodResult>({
    queryKey: ["today_mood", user?.id, startOfDay],
    queryFn: async () => {
      if (!user) return { energy: null, level: null };
      const { data, error } = await supabase
        .from("notes")
        .select("content, updated_at")
        .eq("user_id", user.id)
        .gte("updated_at", new Date(startOfDay - 86400000).toISOString())
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      let bestEnergy: number | null = null;
      let bestTime = 0;
      for (const row of data ?? []) {
        try {
          const parsed = JSON.parse((row as { content: string }).content || "{}");
          const blocks = (parsed.blocks ?? []) as Array<Record<string, unknown>>;
          for (const b of blocks) {
            if (b.type === "mood_energy" && b.mood) {
              const m = b.mood as { recorded_at: string; energy: number };
              const t = new Date(m.recorded_at).getTime();
              if (t >= startOfDay && t < endOfDay && t > bestTime) {
                bestTime = t;
                bestEnergy = m.energy;
              }
            }
          }
        } catch {
          /* ignore */
        }
      }

      const level: EnergyLevel =
        bestEnergy === null ? null : bestEnergy <= 2 ? "low" : bestEnergy >= 4 ? "deep" : null;
      return { energy: bestEnergy, level };
    },
    enabled: !!user && FF_MOOD_ROUTING,
    staleTime: 60_000,
  });
}
