import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import oneappLogo from "@/assets/oneapp-logo.png";
import { useSidebarSettings, basicNavItems } from "@/hooks/useSidebarSettings";
import { useAppStore } from "@/hooks/useAppStore";
import { AppIcon } from "@/components/icons/AppIcon";
import { SidebarPulseStrip } from "./SidebarPulseStrip";
import { SidebarActivityFeed } from "./SidebarActivityFeed";
import { SidebarQuickActions } from "./SidebarQuickActions";

const customizationSection = {
  label: "CUSTOMIZATION",
  items: [
    { title: "Interface", url: "/customization/interface" },
    { title: "System Admin", url: "/customization/admin" },
  ],
  defaultOpen: true,
};

const EASE = [0.16, 1, 0.3, 1] as const;

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  customWidth?: number;
  isBlockLayout?: boolean;
}

interface NavRowProps {
  to: string;
  end?: boolean;
  collapsed: boolean;
  active: boolean;
  title: string;
  iconRoute: string;
  bold?: boolean;
}

function NavRow({
  to,
  end,
  collapsed,
  active,
  title,
  iconRoute,
  bold,
}: NavRowProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={cn(
        "nav-item neu-press relative group",
        collapsed && "justify-center px-2",
      )}
      activeClassName="nav-item-active"
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-rail"
          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full nav-rail-accent"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <AppIcon
        route={iconRoute}
        size="xs"
        showBackground={false}
        className={cn(
          "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
          active && "scale-110",
        )}
      />
      {!collapsed && (
        <span className={cn("truncate", bold && "font-semibold")}>{title}</span>
      )}
    </NavLink>
  );
}

export function AppSidebar({
  collapsed,
  onToggle,
  customWidth = 256,
  isBlockLayout = false,
}: AppSidebarProps) {
  const location = useLocation();
  const { settings } = useSidebarSettings();
  const { isInstalled } = useAppStore();

  const enabledBasicItems = basicNavItems.filter((item) =>
    settings.basicItems.includes(item.id),
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {
        "": true,
        CUSTOMIZATION: true,
      };
      settings.customSections.forEach((section) => {
        initial[section.label] = true;
      });
      return initial;
    },
  );

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  const sidebarWidthStyle = collapsed ? { width: 64 } : { width: customWidth };

  return (
    <aside
      className={cn(
        "h-full bg-sidebar border-r-2 border-sidebar-border flex flex-col transition-all duration-300",
        "shadow-[4px_0_18px_-6px_rgba(0,0,0,0.18)] dark:shadow-[4px_0_18px_-6px_rgba(0,0,0,0.55)]",
        isBlockLayout && "border-2 border-sidebar-border rounded-xl shadow-lg",
      )}
      style={{
        ...sidebarWidthStyle,
        fontSize: "var(--app-font-size, 16px)",
        lineHeight: "var(--app-line-height, 1.5)",
        letterSpacing: "var(--app-letter-spacing, 0)",
      }}
    >
      {/* Logo */}
      <div className="h-12 flex items-center justify-between px-4 relative">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex items-center gap-2.5"
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-primary/40 blur-md animate-logo-halo" />
              <img
                src={oneappLogo}
                alt="OneApp"
                className="relative w-7 h-7 drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
              />
            </div>
            <span className="font-semibold text-foreground text-base tracking-tight">
              OneApp
            </span>
          </motion.div>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onToggle}
          className={cn(
            "neu-press p-1.5 rounded-md bg-sidebar-border hover:bg-accent transition-colors",
            collapsed && "mx-auto",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="block"
          >
            <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
          </motion.span>
        </motion.button>
      </div>

      {/* Pinned quick actions */}
      <SidebarQuickActions collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {enabledBasicItems.length > 0 && (
          <div className="mb-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
              className="space-y-1 px-2"
            >
              {enabledBasicItems.map((item) => (
                <motion.div
                  key={item.url}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.35, ease: EASE },
                    },
                  }}
                >
                  <NavRow
                    to={item.url}
                    end={item.url === "/"}
                    collapsed={collapsed}
                    active={isActive(item.url)}
                    title={item.title}
                    iconRoute={item.url}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {settings.customSections.map((section) => (
          <div key={section.id} className="mb-2">
            {section.label && collapsed && (
              <div className="flex justify-center py-2">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              </div>
            )}

            {section.label && !collapsed && (
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-sidebar-foreground uppercase tracking-wider hover:text-foreground/70 transition-colors text-xs font-normal"
              >
                {section.label}
                <motion.span
                  animate={{
                    rotate: openSections[section.label] ? 0 : -90,
                  }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <ChevronUp className="w-3 h-3" />
                </motion.span>
              </button>
            )}

            <AnimatePresence initial={false}>
              {(openSections[section.label] || collapsed) &&
                section.items.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="space-y-1 px-2 overflow-hidden"
                  >
                    {section.items
                      .filter((item) => isInstalled(item.url))
                      .map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: idx * 0.04,
                            duration: 0.3,
                            ease: EASE,
                          }}
                        >
                          <NavRow
                            to={item.url}
                            collapsed={collapsed}
                            active={isActive(item.url)}
                            title={item.title}
                            iconRoute={item.url}
                            bold
                          />
                        </motion.div>
                      ))}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        ))}

        {/* Activity feed */}
        <div className="mt-3 border-t border-sidebar-border/60 pt-2">
          <SidebarActivityFeed collapsed={collapsed} />
        </div>
      </nav>

      {/* Customization */}
      <div className="border-t border-sidebar-border pt-3 pb-1">
        {collapsed && (
          <button
            onClick={() => toggleSection(customizationSection.label)}
            className="w-full flex justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {openSections[customizationSection.label] ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {!collapsed && (
          <button
            onClick={() => toggleSection(customizationSection.label)}
            className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-medium text-sidebar-foreground uppercase tracking-wider hover:text-foreground/70 transition-colors"
          >
            {customizationSection.label}
            <motion.span
              animate={{
                rotate: openSections[customizationSection.label] ? 0 : -90,
              }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <ChevronUp className="w-3 h-3" />
            </motion.span>
          </button>
        )}

        <AnimatePresence initial={false}>
          {openSections[customizationSection.label] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="space-y-1 px-2 overflow-hidden"
            >
              {customizationSection.items.map((item) => (
                <NavRow
                  key={item.url}
                  to={item.url}
                  collapsed={collapsed}
                  active={isActive(item.url)}
                  title={item.title}
                  iconRoute={item.url}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System pulse strip */}
      <SidebarPulseStrip collapsed={collapsed} />
    </aside>
  );
}
