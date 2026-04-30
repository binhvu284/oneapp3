import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Cache key includes project ID to reset after remix
const SCHEMA_SYNC_KEY = "oneapp_schema_synced";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || "unknown";
const FULL_CACHE_KEY = `${SCHEMA_SYNC_KEY}_${PROJECT_ID}`;

let globalHasRun = false;

/**
 * Hook to automatically check/sync schema once per project
 * 
 * After remix/fork, the project ID changes, so this will run again
 * to verify schema integrity.
 * 
 * This is a PASSIVE check - it doesn't create tables, just verifies
 * and logs warnings if schema is incomplete.
 */
export function useSchemaSync() {
  useEffect(() => {
    // Only run once per session
    if (globalHasRun) return;
    globalHasRun = true;

    // Check if already synced for this project
    const alreadySynced = localStorage.getItem(FULL_CACHE_KEY);
    if (alreadySynced === "true") {
      console.log("[SchemaSync] Already verified for project:", PROJECT_ID);
      return;
    }

    // Run schema check
    const checkSchema = async () => {
      try {
        console.log("[SchemaSync] Verifying schema for project:", PROJECT_ID);

        const { data, error } = await supabase.functions.invoke("sync-schema");

        if (error) {
          console.warn("[SchemaSync] Check failed:", error.message);
          return;
        }

        if (data?.success) {
          console.log("[SchemaSync] Schema verified successfully");
          localStorage.setItem(FULL_CACHE_KEY, "true");
        } else {
          console.warn("[SchemaSync] Schema issues detected:", data?.message);
          console.warn("[SchemaSync] Details:", data?.details);
          // Don't cache - allow retry on next load
        }
      } catch (err) {
        console.warn("[SchemaSync] Error during check:", err);
      }
    };

    // Delay check to not block initial render
    const timeoutId = setTimeout(checkSchema, 2000);

    return () => clearTimeout(timeoutId);
  }, []);
}

/**
 * Force re-run schema sync (clears cache)
 */
export function clearSchemaSyncCache() {
  localStorage.removeItem(FULL_CACHE_KEY);
  console.log("[SchemaSync] Cache cleared for project:", PROJECT_ID);
}

/**
 * Get current sync status
 */
export function getSchemaSyncStatus(): {
  projectId: string;
  synced: boolean;
} {
  const synced = localStorage.getItem(FULL_CACHE_KEY) === "true";
  return { projectId: PROJECT_ID, synced };
}
