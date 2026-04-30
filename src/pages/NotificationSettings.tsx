import { Bell, Mail, Smartphone, TrendingUp, Clock, Shield, BookOpen } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationPreferences } from "@/hooks/useNotifications";

interface PreferenceSetting {
  key: keyof NotificationPreferences;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SETTINGS: PreferenceSetting[] = [
  {
    key: "email_notifications",
    icon: <Mail className="w-5 h-5 text-blue-400" />,
    title: "Email Notifications",
    description: "Receive important updates and alerts via email",
  },
  {
    key: "in_app_notifications",
    icon: <Smartphone className="w-5 h-5 text-purple-400" />,
    title: "In-App Notifications",
    description: "Show notifications inside the app",
  },
  {
    key: "crypto_price_alerts",
    icon: <TrendingUp className="w-5 h-5 text-green-400" />,
    title: "Crypto Price Alerts",
    description: "Get notified when watchlist prices cross your thresholds",
  },
  {
    key: "note_reminders",
    icon: <Clock className="w-5 h-5 text-yellow-400" />,
    title: "Note Reminders",
    description: "Receive reminders for notes you've scheduled",
  },
  {
    key: "security_alerts",
    icon: <Shield className="w-5 h-5 text-red-400" />,
    title: "Security Alerts",
    description: "Get notified about new logins and security events",
  },
  {
    key: "weekly_digest",
    icon: <BookOpen className="w-5 h-5 text-orange-400" />,
    title: "Weekly Digest",
    description: "A weekly summary of your activity across all apps",
  },
];

export default function NotificationSettings() {
  const { preferences, isLoading, isSaving, updatePreference } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Control which notifications you receive and how they're delivered.
        </p>
      </div>

      <div className="space-y-2">
        {SETTINGS.map((setting) => (
          <div key={setting.key} className="setting-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {setting.icon}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{setting.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="w-10 h-5 rounded-full" />
            ) : (
              <Switch
                checked={preferences[setting.key]}
                onCheckedChange={(val) => updatePreference(setting.key, val)}
                disabled={isSaving}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
