import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource } from "@/hooks/useAuthSource";

export type PulseStatus = "ok" | "warn" | "bad" | "idle";

export interface SystemPulse {
  db: PulseStatus;
  deploy: PulseStatus;
  ai: PulseStatus;
  dbLatency?: number;
  lastCheckedAt?: number;
}

const PING_INTERVAL_MS = 60_000;

/**
 * Lightweight client-side pulse. Real telemetry lands in P2 (deploy)
 * and P7 (db_health_log). Until then we ping Supabase auth and check
 * for the presence of AI API keys to give the strip a meaningful read.
 */
export function useSystemPulse(): SystemPulse {
  const { user } = useAuthSource();
  const [pulse, setPulse] = useState<SystemPulse>({
    db: "idle",
    deploy: "idle",
    ai: "idle",
  });

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const start = performance.now();
      let db: PulseStatus = "ok";
      let latency: number | undefined;

      try {
        const { error } = await supabase
          .from("oneapp_users")
          .select("id", { count: "exact", head: true })
          .limit(1);
        latency = Math.round(performance.now() - start);
        if (error) db = "bad";
        else if (latency > 1500) db = "warn";
      } catch {
        db = "bad";
      }

      let ai: PulseStatus = "idle";
      if (user) {
        try {
          const { count, error } = await supabase
            .from("user_api_keys")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id);
          if (error) ai = "warn";
          else ai = (count ?? 0) > 0 ? "ok" : "idle";
        } catch {
          ai = "warn";
        }
      }

      if (cancelled) return;
      setPulse({
        db,
        deploy: "idle",
        ai,
        dbLatency: latency,
        lastCheckedAt: Date.now(),
      });
    };

    tick();
    const id = window.setInterval(tick, PING_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user]);

  return pulse;
}
