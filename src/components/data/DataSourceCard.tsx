import {
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Settings,
  RefreshCw,
  Unlink,
  ExternalLink,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectionStatus } from "@/hooks/useExternalConnection";
import lovableLogo from "@/assets/lovable-logo.png";
import supabaseLogo from "@/assets/supabase-logo.svg";

interface DataSourceCardProps {
  type: "lovable" | "supabase";
  isActive: boolean;
  connectionStatus?: ConnectionStatus;
  lastTestedAt?: string | null;
  errorMessage?: string | null;
  isTesting?: boolean;
  isSwitching?: boolean;
  hasServiceKey?: boolean;
  isDisabled?: boolean;
  onSetActive: () => void;
  onSetupConnection?: () => void;
  onTestConnection?: () => void;
  onEditConnection?: () => void;
  onDisconnect?: () => void;
  onOpenTool?: () => void;
}

export function DataSourceCard({
  type,
  isActive,
  connectionStatus = "not_setup",
  lastTestedAt,
  errorMessage,
  isTesting = false,
  isSwitching = false,
  hasServiceKey = false,
  isDisabled = false,
  onSetActive,
  onSetupConnection,
  onTestConnection,
  onEditConnection,
  onDisconnect,
  onOpenTool,
}: DataSourceCardProps) {
  const isLovable = type === "lovable";
  const logo = isLovable ? lovableLogo : supabaseLogo;
  const title = isLovable ? "Lovable Cloud" : "Supabase";
  const description = isLovable
    ? "Built-in database - Always available"
    : connectionStatus === "not_setup"
      ? "Connect your own Supabase project"
      : "External Supabase connection";

  // Status display
  const getStatusDisplay = () => {
    if (isLovable) {
      return { icon: CheckCircle, text: "Connected", color: "text-emerald-500" };
    }

    if (isTesting) {
      return { icon: Loader2, text: "Testing...", color: "text-yellow-500", animate: true };
    }

    switch (connectionStatus) {
      case "connected":
        return { icon: CheckCircle, text: "Connected", color: "text-emerald-500" };
      case "testing":
        return { icon: Loader2, text: "Testing...", color: "text-yellow-500", animate: true };
      case "error":
        return { icon: XCircle, text: "Error", color: "text-destructive" };
      case "disconnected":
        return { icon: AlertCircle, text: "Disconnected", color: "text-yellow-500" };
      default:
        return { icon: XCircle, text: "Not Setup", color: "text-muted-foreground" };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  const formatLastTested = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card
      className={`p-4 bg-card border transition-colors relative ${isActive ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30"
        } ${isSwitching ? "pointer-events-none" : ""} ${isDisabled ? "opacity-50" : ""}`}
    >
      {/* Loading overlay when switching */}
      {isSwitching && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Switching...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLovable ? "bg-primary/10" : "bg-emerald-500/10"
            }`}>
            <img src={logo} alt={title} className="w-6 h-6" />
          </div>

          {/* Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{title}</h3>
              {/* Current badge */}
              {isActive && (
                <Badge variant="default" className="text-xs bg-primary/20 text-primary border-0 hover:bg-primary/20">
                  Current
                </Badge>
              )}
              {/* Status badge */}
              <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                <StatusIcon className={`w-3.5 h-3.5 ${status.animate ? "animate-spin" : ""}`} />
                <span>{status.text}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            {!isLovable && lastTestedAt && connectionStatus === "connected" && (
              <p className="text-xs text-muted-foreground">
                Last tested: {formatLastTested(lastTestedAt)}
              </p>
            )}
            {!isLovable && errorMessage && connectionStatus === "error" && (
              <p className="text-xs text-destructive line-clamp-1">{errorMessage}</p>
            )}
            {/* Warning when connected but missing service key */}
            {!isLovable && connectionStatus === "connected" && !hasServiceKey && (
              <p className="text-xs text-warning">
                ⚠️ Service Key required for authentication
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Radio indicator */}
          <button
            onClick={onSetActive}
            disabled={(!isLovable && connectionStatus !== "connected") || isDisabled}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActive
                ? "border-primary bg-primary"
                : "border-muted-foreground/40 hover:border-muted-foreground"
              } ${(!isLovable && connectionStatus !== "connected") || isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isActive && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </button>

          {/* 3-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isLovable ? (
                <>
                  {!isActive && !isDisabled && (
                    <DropdownMenuItem onClick={onSetActive}>
                      <Radio className="mr-2 h-4 w-4" />
                      Use This Database
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onOpenTool}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Version & Backup
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenTool}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Tool
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {connectionStatus === "not_setup" ? (
                    <DropdownMenuItem onClick={onSetupConnection}>
                      <Settings className="mr-2 h-4 w-4" />
                      Setup Connection
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {!isActive && connectionStatus === "connected" && (
                        <>
                          <DropdownMenuItem onClick={onSetActive}>
                            <Radio className="mr-2 h-4 w-4" />
                            Use This Database
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={onTestConnection} disabled={isTesting}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isTesting ? "animate-spin" : ""}`} />
                        Test Connection
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onEditConnection}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Connection
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDisconnect}
                        className="text-destructive focus:text-destructive"
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
