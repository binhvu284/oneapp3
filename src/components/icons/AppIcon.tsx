import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  Shield,
  Database,
  MonitorPlay,
  Code,
  Bitcoin,
  StickyNote,
  Settings,
  User,
  Sun,
  Layout,
  Type,
  PanelLeft,
  AlignJustify,
  Folder,
} from "lucide-react";

interface AppIconConfig {
  icon: LucideIcon;
  gradient: string;
  color: string; // primary color for no-background mode
}

const appIconConfig: Record<string, AppIconConfig> = {
  "/": {
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-blue-700",
    color: "text-blue-500",
  },
  "/developing/ai": {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-700",
    color: "text-violet-500",
  },
  "/developing/ai/chat": {
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-700",
    color: "text-violet-500",
  },
  "/customization/admin": {
    icon: Shield,
    gradient: "from-slate-500 to-slate-700",
    color: "text-slate-500",
  },
  "/developing/data": {
    icon: Database,
    gradient: "from-cyan-500 to-teal-700",
    color: "text-cyan-500",
  },
  "/workspace/data": {
    icon: Database,
    gradient: "from-cyan-500 to-teal-700",
    color: "text-cyan-500",
  },
  "/library": {
    icon: MonitorPlay,
    gradient: "from-rose-500 to-pink-700",
    color: "text-rose-500",
  },
  "/workspace/developer": {
    icon: Code,
    gradient: "from-amber-500 to-orange-700",
    color: "text-amber-500",
  },
  "/apps/crypto": {
    icon: Bitcoin,
    gradient: "from-yellow-500 to-amber-700",
    color: "text-yellow-500",
  },
  "/apps/onenote": {
    icon: StickyNote,
    gradient: "from-emerald-500 to-green-700",
    color: "text-emerald-500",
  },
  // Sub-pages / Customization
  "/customization/interface": {
    icon: Settings,
    gradient: "from-indigo-500 to-indigo-700",
    color: "text-indigo-500",
  },
  "/customization/interface/theme": {
    icon: Sun,
    gradient: "from-indigo-500 to-indigo-700",
    color: "text-indigo-500",
  },
  "/customization/interface/layout": {
    icon: Layout,
    gradient: "from-indigo-500 to-indigo-700",
    color: "text-indigo-500",
  },
  "/customization/interface/display": {
    icon: Type,
    gradient: "from-indigo-500 to-indigo-700",
    color: "text-indigo-500",
  },
  "/customization/interface/sidebar": {
    icon: PanelLeft,
    gradient: "from-indigo-500 to-indigo-700",
    color: "text-indigo-500",
  },
  "/customization/interface/header": {
    icon: AlignJustify,
    gradient: "from-indigo-500 to-indigo-700",
    color: "text-indigo-500",
  },
  "/profile": {
    icon: User,
    gradient: "from-sky-500 to-sky-700",
    color: "text-sky-500",
  },
  "/settings": {
    icon: Settings,
    gradient: "from-gray-500 to-gray-700",
    color: "text-gray-500",
  },
};

const sizeMap = {
  xs: { container: "w-5 h-5 rounded-md", icon: "w-3 h-3" },
  sm: { container: "w-8 h-8 rounded-xl", icon: "w-4 h-4" },
  md: { container: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
  lg: { container: "w-14 h-14 rounded-2xl", icon: "w-7 h-7" },
};

function findConfig(route: string): AppIconConfig {
  // Exact match
  if (appIconConfig[route]) return appIconConfig[route];

  // Parent route match (e.g. /developing/ai/chat -> /developing/ai)
  const segments = route.split("/").filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const parent = "/" + segments.join("/");
    if (appIconConfig[parent]) return appIconConfig[parent];
  }

  // Root fallback
  if (appIconConfig["/"]) return appIconConfig["/"];

  return { icon: Folder, gradient: "from-gray-400 to-gray-600", color: "text-gray-400" };
}

interface AppIconProps {
  route: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showBackground?: boolean;
}

export function AppIcon({ route, size = "md", className, showBackground = true }: AppIconProps) {
  const config = findConfig(route);
  const Icon = config.icon;
  const sizing = sizeMap[size];

  if (!showBackground) {
    return <Icon className={cn(sizing.icon, config.color, className)} />;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br shadow-sm",
        config.gradient,
        sizing.container,
        className
      )}
    >
      <Icon className={cn(sizing.icon, "text-white")} />
    </div>
  );
}

export { findConfig as getAppIconConfig };
