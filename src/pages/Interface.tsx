import { useNavigate } from "react-router-dom";
import { SettingCard } from "@/components/settings/SettingCard";
import { Sun, Layout, Monitor, Menu, AlignJustify, LucideIcon } from "lucide-react";

interface InterfaceSetting {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
}

const interfaceSettings: InterfaceSetting[] = [
  {
    icon: Sun,
    title: "Theme Settings",
    description: "Choose between light and dark themes, or customize colors to match your style.",
    path: "/customization/interface/theme",
  },
  {
    icon: Layout,
    title: "Layout Options",
    description: "Customize sidebar width, content density, and component spacing to optimize your workspace.",
    path: "/customization/interface/layout",
  },
  {
    icon: Monitor,
    title: "Display Settings",
    description: "Adjust font sizes, icon sizes, and visual effects to improve readability and reduce eye strain.",
    path: "/customization/interface/display",
  },
  {
    icon: Menu,
    title: "Sidebar Setting",
    description: "Configure sidebar navigation items and create custom sections to organize your workspace.",
    path: "/customization/interface/sidebar",
  },
  {
    icon: AlignJustify,
    title: "Header Setting",
    description: "Configure header navigation items and customize header appearance.",
    path: "/customization/interface/header",
  },
];

export default function Interface() {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-4">
      {interfaceSettings.map((setting) => (
        <SettingCard
          key={setting.title}
          icon={setting.icon}
          title={setting.title}
          description={setting.description}
          onClick={() => navigate(setting.path)}
        />
      ))}
    </div>
  );
}
