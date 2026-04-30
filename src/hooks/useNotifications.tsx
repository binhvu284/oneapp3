import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { toast } from "sonner";

export interface NotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  crypto_price_alerts: boolean;
  note_reminders: boolean;
  security_alerts: boolean;
  weekly_digest: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  email_notifications: true,
  in_app_notifications: true,
  crypto_price_alerts: true,
  note_reminders: true,
  security_alerts: true,
  weekly_digest: false,
};

const SETTINGS_KEY = "notification_preferences";

export function useNotifications() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      const stored = (data as any)?.notification_preferences;
      if (stored && typeof stored === "object") {
        setPreferences({ ...DEFAULT_PREFS, ...stored });
      }
    } catch {
      // fall back to defaults silently
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  const updatePreference = useCallback(async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!user) return;
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          { user_id: user.id, [SETTINGS_KEY]: updated },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    } catch {
      setPreferences(preferences);
      toast.error("Failed to save notification preference");
    } finally {
      setIsSaving(false);
    }
  }, [user, preferences]);

  return { preferences, isLoading, isSaving, updatePreference };
}
