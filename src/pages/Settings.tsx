import { User, Shield, Palette, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SettingCard } from "@/components/settings/SettingCard";

export default function Settings() {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "Account",
      description: "Manage your email, phone number, and password",
      icon: User,
      path: "/settings/account",
    },
    {
      title: "Profile",
      description: "Edit your display name, avatar, bio, and social links",
      icon: User,
      path: "/settings/profile",
    },
    {
      title: "Security",
      description: "Two-factor authentication, sessions, and security settings",
      icon: Shield,
      path: "/settings/security",
    },
    {
      title: "Appearance",
      description: "Customize theme, layout, and display preferences",
      icon: Palette,
      path: "/settings/appearance",
    },
    {
      title: "Notifications",
      description: "Configure notification preferences and alerts",
      icon: Bell,
      path: "/settings/notifications",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => (
          <SettingCard
            key={section.title}
            title={section.title}
            description={section.description}
            icon={section.icon}
            onClick={() => !section.disabled && navigate(section.path)}
            disabled={section.disabled}
            badge={section.badge}
          />
        ))}
      </div>
    </div>
  );
}
