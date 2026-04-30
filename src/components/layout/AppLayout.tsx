import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";
import { GlobalCommandMenu } from "@/components/GlobalCommandMenu";
import { AnimatePresence, motion } from "framer-motion";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { settings } = useLayoutSettings();

  const isBlockLayout = settings.layoutStyle === "block";
  const isAIChatRoute = location.pathname === "/developing/ai/chat";

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  return (
    <div
      className={cn(
        "h-[100dvh] flex w-full overflow-hidden",
        isBlockLayout && "bg-muted/30",
        isBlockLayout && !isAIChatRoute && "p-2 gap-2"
      )}
    >
      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <div
        className={cn(
          "flex-shrink-0 h-full",
          // Desktop styles
          !isMobile && "sticky top-0",
          // Mobile styles
          isMobile && "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
          isMobile && !mobileOpen && "-translate-x-full",
          // Block layout styles
          isBlockLayout && !isMobile && "rounded-xl overflow-hidden"
        )}
      >
        <AppSidebar
          collapsed={isMobile ? false : sidebarCollapsed}
          onToggle={() => {
            if (isMobile) {
              setMobileOpen(false);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          customWidth={sidebarCollapsed ? 64 : settings.sidebarWidth}
          isBlockLayout={isBlockLayout}
        />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden bg-background",
          isBlockLayout ? (isAIChatRoute ? "h-full" : "h-full gap-2") : "h-[100dvh]"
        )}
      >
        {/* Header - Fixed */}
        <div
          className={cn(
            "flex-shrink-0",
            isBlockLayout && "rounded-xl overflow-hidden"
          )}
        >
          <AppHeader
            onMenuClick={() => setMobileOpen(true)}
            customHeight={settings.headerHeight}
            isBlockLayout={isBlockLayout}
          />
        </div>

        {/* Scrollable main content */}
        <main
          className={cn(
            "flex-1 overflow-auto scrollbar-thin bg-background px-4 pt-2",
            isBlockLayout && "rounded-xl"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cn("h-full w-full", isAIChatRoute && "max-h-full")}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <GlobalCommandMenu />
    </div>
  );
}
