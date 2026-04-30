import { useState } from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import oneappLogo from "@/assets/oneapp-logo.png";
import { useSidebarSettings, basicNavItems } from "@/hooks/useSidebarSettings";
import { useAppStore } from "@/hooks/useAppStore";
import { AppIcon } from "@/components/icons/AppIcon";
const customizationSection = {
  label: "CUSTOMIZATION",
  items: [{
    title: "Interface",
    url: "/customization/interface",
  }, {
    title: "System Admin",
    url: "/customization/admin",
  }],
  defaultOpen: true
};
interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  customWidth?: number;
  isBlockLayout?: boolean;
}
export function AppSidebar({
  collapsed,
  onToggle,
  customWidth = 256,
  isBlockLayout = false
}: AppSidebarProps) {
  const location = useLocation();
  const { settings } = useSidebarSettings();
  const { isInstalled } = useAppStore();

  // Build dynamic sections from settings
  const enabledBasicItems = basicNavItems.filter(item => settings.basicItems.includes(item.id));
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      "": true,
      CUSTOMIZATION: true
    };
    settings.customSections.forEach(section => {
      initial[section.label] = true;
    });
    return initial;
  });
  const toggleSection = (label: string) => {
    setOpenSections(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };
  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };
  const sidebarWidthStyle = collapsed ? {
    width: 64
  } : {
    width: customWidth
  };
  return <aside className={cn("h-full bg-sidebar border-r-2 border-sidebar-border flex flex-col transition-all duration-300 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.15)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.4)]", isBlockLayout && "border-2 border-sidebar-border rounded-xl shadow-lg")} style={{
    ...sidebarWidthStyle,
    fontSize: "var(--app-font-size, 16px)",
    lineHeight: "var(--app-line-height, 1.5)",
    letterSpacing: "var(--app-letter-spacing, 0)"
  }}>
    {/* Logo Section */}
    <div className="h-12 flex items-center justify-between px-4">
      {!collapsed && <div className="flex items-center gap-2.5">
        <img src={oneappLogo} alt="OneApp" className="w-7 h-7" />
        <span className="font-semibold text-foreground text-base tracking-tight">OneApp</span>
      </div>}
      <button onClick={onToggle} className={cn("p-1.5 rounded-md bg-sidebar-border hover:bg-accent transition-colors", collapsed && "mx-auto")}>
        <ChevronLeft className={cn("w-4 h-4 text-sidebar-foreground transition-transform", collapsed && "rotate-180")} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
      {/* Basic Navigation Items */}
      {enabledBasicItems.length > 0 && <div className="mb-2">
        <div className="space-y-1 px-2">
          {enabledBasicItems.map(item => {
            return <NavLink key={item.url} to={item.url} end={item.url === "/"} className={cn("nav-item", collapsed && "justify-center px-2")} activeClassName="nav-item-active">
              <AppIcon route={item.url} size="xs" showBackground={false} className="flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>;
          })}
        </div>
      </div>}

      {/* Custom Sections from Settings */}
      {settings.customSections.map(section => <div key={section.id} className="mb-2">
        {/* Section separator dot for collapsed state */}
        {section.label && collapsed && <div className="flex justify-center py-2">
          <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
        </div>}

        {section.label && !collapsed && <button onClick={() => toggleSection(section.label)} className="w-full flex items-center justify-between px-4 py-2 text-sidebar-foreground uppercase tracking-wider hover:text-foreground/70 transition-colors text-xs font-normal">
          {section.label}
          {openSections[section.label] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>}

        {(openSections[section.label] || collapsed) && section.items.length > 0 && <div className="space-y-1 px-2">
          {section.items.filter(item => isInstalled(item.url)).map(item => {
            return <NavLink key={item.id} to={item.url} end={item.url === "/"} className={cn("nav-item", collapsed && "justify-center px-2")} activeClassName="nav-item-active">
              <AppIcon route={item.url} size="xs" showBackground={false} className="flex-shrink-0" />
              {!collapsed && <span className="font-semibold">{item.title}</span>}
            </NavLink>;
          })}
        </div>}
      </div>)}
    </nav>

    {/* Customization Section - Fixed at bottom */}
    <div className="border-t border-sidebar-border pt-4 pb-2">
      {/* Toggle button for collapsed state */}
      {collapsed && <button onClick={() => toggleSection(customizationSection.label)} className="w-full flex justify-center py-2 text-muted-foreground hover:text-foreground transition-colors">
        {openSections[customizationSection.label] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>}

      {customizationSection.label && !collapsed && <button onClick={() => toggleSection(customizationSection.label)} className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-medium text-sidebar-foreground uppercase tracking-wider hover:text-foreground/70 transition-colors">
        {customizationSection.label}
        {openSections[customizationSection.label] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>}

      {openSections[customizationSection.label] && <div className="space-y-1 px-2">
        {customizationSection.items.map(item => <NavLink key={item.url} to={item.url} className={cn("nav-item", collapsed && "justify-center px-2")} activeClassName="nav-item-active">
          <AppIcon route={item.url} size="xs" showBackground={false} className="flex-shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>)}
      </div>}
    </div>
  </aside>;
}