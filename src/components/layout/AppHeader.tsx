import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  BookOpen,
  LogOut,
  Menu,
} from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthSource } from "@/hooks/useAuthSource";
import { useDataSourceProfile } from "@/hooks/useDataSourceProfile";
import { toast } from "sonner";

interface RouteInfo {
  title: string;
  parent?: string;
}

const routeConfig: Record<string, RouteInfo> = {
  "/": { title: "Dashboard" },
  "/library": { title: "OneLibrary" },
  "/workspace/data": { title: "OneApp Data" },
  "/workspace/developer": { title: "OneApp Developer" },
  "/developing/data": { title: "OneApp Data" },
  "/developing/ai": { title: "OneApp AI" },
  "/developing/ai/chat": { title: "AI Chat", parent: "/developing/ai" },
  "/customization/interface": { title: "Interface" },
  "/customization/interface/theme": { title: "Theme Settings", parent: "/customization/interface" },
  "/customization/interface/layout": { title: "Layout Options", parent: "/customization/interface" },
  "/customization/interface/display": { title: "Display Settings", parent: "/customization/interface" },
  "/customization/interface/sidebar": { title: "Sidebar Setting", parent: "/customization/interface" },
  "/customization/interface/header": { title: "Header Setting", parent: "/customization/interface" },
  "/customization/admin": { title: "System Admin" },
  "/apps/crypto": { title: "OneCrypto" },
  "/apps/onenote": { title: "OneNote" },
  "/profile": { title: "My Profile" },
  "/settings": { title: "Settings" },
  "/settings/account": { title: "Account", parent: "/settings" },
  "/settings/profile": { title: "Profile", parent: "/settings" },
};

interface AppHeaderProps {
  onMenuClick?: () => void;
  customHeight?: number;
  isBlockLayout?: boolean;
}

export function AppHeader({ onMenuClick, customHeight = 48, isBlockLayout = false }: AppHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuthSource();
  const { profile } = useDataSourceProfile();

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Fallback chain: display_name (user-set override) -> name (required DB field) -> "User"
  // NEVER use email prefix as display name
  const displayName =
    user?.display_name ||           // Priority: explicit override set by user
    user?.name ||                   // Fallback: `name` column from oneapp_users (always has data)
    profile?.display_name ||        // Fallback: from profiles table
    "User";                         // Last resort: generic label

  const handleLogout = async () => {
    // Guard: Prevent multiple logout calls
    if (isLoggingOut) {
      console.log("[AppHeader] Logout already in progress, skipping...");
      return;
    }

    // Close dropdown first to prevent re-renders triggering multiple calls
    setIsOpen(false);
    setIsLoggingOut(true);

    console.log("[AppHeader] Starting logout...");
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("[AppHeader] Logout error:", error);
      toast.info("Logged out");
    } finally {
      navigate("/home");
      // Note: Don't reset isLoggingOut since we're navigating away
    }
  };

  const getRouteInfo = (): RouteInfo => {
    // Check for exact match first
    if (routeConfig[location.pathname]) {
      return routeConfig[location.pathname];
    }

    // Check for partial matches
    for (const [path, config] of Object.entries(routeConfig)) {
      if (location.pathname.startsWith(path) && path !== "/") {
        return config;
      }
    }

    return routeConfig["/"];
  };

  const currentRoute = getRouteInfo();
  const parentRoute = currentRoute.parent ? routeConfig[currentRoute.parent] : null;
  const iconRoute = currentRoute.parent || location.pathname;

  return (
    <header
      className={cn(
        "bg-header border-b-2 border-header-border flex items-center justify-between px-4 md:px-6 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]",
        isBlockLayout && "border-2 border-header-border rounded-xl shadow-lg"
      )}
      style={{ height: customHeight }}
    >
      {/* Left: Menu button (mobile) + Page Title with Breadcrumb */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
        <AppIcon route={iconRoute} size="xs" showBackground={false} />

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5">
          {parentRoute && currentRoute.parent ? (
            <>
              <button
                onClick={() => navigate(currentRoute.parent!)}
                className="text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                {parentRoute.title}
              </button>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-base font-semibold text-header-foreground">
                {currentRoute.title}
              </h1>
            </>
          ) : (
            <button
              onClick={() => navigate(location.pathname)}
              className="text-base font-semibold text-header-foreground hover:text-primary transition-colors"
            >
              {currentRoute.title}
            </button>
          )}
        </div>
      </div>

      {/* Right: User Section */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
            <Avatar className="w-9 h-9 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getInitials(user?.display_name || user?.name || profile?.display_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            {!isMobile && <span className="text-sm font-medium text-foreground">{displayName}</span>}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/library")}
          >
            <BookOpen className="w-4 h-4" />
            <span>Library</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
