import { Database, Folder, HardDrive, FileSpreadsheet, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useSystemConnection } from "@/hooks/useSystemConnection";
import { useExternalConnection } from "@/hooks/useExternalConnection";

export default function WorkspaceData() {
  const navigate = useNavigate();
  const { connection: systemConn, isLoading: systemLoading } = useSystemConnection();
  const { connection: extConn, isLoading: extLoading } = useExternalConnection();

  const isLoading = systemLoading || extLoading;

  // Count active connections
  const systemActive = systemConn?.is_active && systemConn?.connection_status === "connected";
  const externalActive = extConn?.is_active && extConn?.connection_status === "connected";
  const dbCount = (systemActive ? 1 : 0) + (externalActive ? 1 : 0);

  const hasAnyConnection = dbCount > 0;

  const connections = [
    systemActive && {
      name: "System Database",
      url: systemConn?.supabase_url ?? "",
      status: systemConn?.connection_status ?? "disconnected",
      type: "system",
    },
    externalActive && {
      name: extConn?.name ?? "External Database",
      url: extConn?.supabase_url ?? "",
      status: extConn?.connection_status ?? "disconnected",
      type: "external",
    },
  ].filter(Boolean) as Array<{ name: string; url: string; status: string; type: string }>;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspace Data</h1>
          <p className="text-muted-foreground mt-1">Manage databases, files, and integrations</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/developing/data")}>
          <Plus className="w-4 h-4" />
          New Connection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Databases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{dbCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">—</div>
            <p className="text-xs text-muted-foreground">Managed by Supabase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Schema Sync</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{hasAnyConnection ? "Active" : "—"}</div>
            )}
            <p className="text-xs text-muted-foreground">Via DevelopingData</p>
          </CardContent>
        </Card>
      </div>

      {/* Connection list or empty state */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : hasAnyConnection ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Active Connections</h2>
          {connections.map((conn) => (
            <div key={conn.type} className="setting-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Database className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{conn.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{conn.url || "URL not available"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={conn.status === "connected"
                    ? "text-success border-success/50"
                    : "text-destructive border-destructive/50"
                  }
                >
                  {conn.status === "connected" ? "Connected" : conn.status}
                </Badge>
                <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => navigate("/developing/data")}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg border-border bg-card/50 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Data Sources Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Connect your first database or cloud storage to start managing your data from one place.
          </p>
          <Button onClick={() => navigate("/developing/data")} className="gap-2">
            <Plus className="w-4 h-4" />
            Connect Database
          </Button>
        </div>
      )}
    </div>
  );
}
