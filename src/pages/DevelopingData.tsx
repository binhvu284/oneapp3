import { useState } from "react";
import { Database, CheckCircle, XCircle, AlertCircle, ExternalLink, Settings, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataExportPanel } from "@/components/data/DataExportPanel";
import { DataBackupPanel } from "@/components/data/DataBackupPanel";
import { SchemaSyncPanel } from "@/components/data/SchemaSyncPanel";
import { SchemaSection } from "@/components/data/SchemaSection";
import { SetupConnectionDialog } from "@/components/data/SetupConnectionDialog";
import { useSystemConnection } from "@/hooks/useSystemConnection";

// ============================================================================
// Database Provider abstraction - flexible for future providers (Firebase, Neon...)
// ============================================================================

interface DatabaseProvider {
  id: string;
  name: string;
  logo?: string;
  isConnected: boolean;
  connectionMethod: "env" | "api" | "cli";
  url?: string;
  description: string;
}

// ============================================================================
// Status helpers
// ============================================================================

function StatusBadge({ status }: { status: string | undefined | null }) {
  if (status === "connected") {
    return (
      <Badge className="gap-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">
        <CheckCircle className="w-3 h-3" /> Connected
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge className="gap-1 bg-red-500/20 text-red-400 border-red-500/30 border text-xs">
        <XCircle className="w-3 h-3" /> Error
      </Badge>
    );
  }
  if (status === "not_setup") {
    return (
      <Badge className="gap-1 bg-muted text-muted-foreground border text-xs">
        <AlertCircle className="w-3 h-3" /> Not Setup
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30 border text-xs">
      <AlertCircle className="w-3 h-3" /> {status || "Unknown"}
    </Badge>
  );
}

// ============================================================================
// Supabase Provider Card
// ============================================================================

interface SupabaseProviderCardProps {
  connection: ReturnType<typeof useSystemConnection>["connection"];
  isLoading: boolean;
  isTesting: boolean;
  isSaving: boolean;
  onTest: () => void;
  onEdit: () => void;
}

function SupabaseProviderCard({
  connection,
  isLoading,
  isTesting,
  onTest,
  onEdit,
}: SupabaseProviderCardProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const status = connection?.connection_status;
  const isConnected = status === "connected";
  const url = connection?.supabase_url;

  return (
    <Card className={`p-4 border transition-colors ${isConnected ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-emerald-500" />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-sm">Supabase</h3>
              <StatusBadge status={status} />
              {isConnected && (
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {url ? url.replace("https://", "").split(".")[0] + ".supabase.co" : "External Supabase project"}
            </p>
            {connection?.last_tested_at && (
              <p className="text-xs text-muted-foreground">
                Last tested: {new Date(connection.last_tested_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={isTesting || !connection?.supabase_url}
            className="gap-1.5 text-xs"
          >
            {isTesting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Test
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
          >
            <Settings className="w-4 h-4" />
          </Button>
          {connection?.supabase_url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Future Provider Placeholder
// ============================================================================

function AddProviderPlaceholder() {
  return (
    <Card className="p-4 border border-dashed border-border bg-muted/20 flex items-center gap-3 opacity-60">
      <div className="w-10 h-10 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
        <Plus className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Add Database Provider</p>
        <p className="text-xs text-muted-foreground">Firebase, Neon, PlanetScale and more — coming soon</p>
      </div>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function DevelopingData() {
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  const {
    connection,
    isLoading,
    isTesting,
    isSaving,
    fetchConnection,
    saveConnection,
    testConnection,
  } = useSystemConnection();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">OneApp Data</h1>
        <p className="text-muted-foreground mt-2">
          Manage your database connections, data, and schemas. Export, import, and backup your data without leaving OneApp.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sources" className="w-full">
        <TabsList className="flex overflow-x-auto w-full max-w-lg justify-start sm:grid sm:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="sources" className="flex-shrink-0">Sources</TabsTrigger>
          <TabsTrigger value="export" className="flex-shrink-0">Export / Import</TabsTrigger>
          <TabsTrigger value="backup" className="flex-shrink-0">Backup</TabsTrigger>
          <TabsTrigger value="schema" className="flex-shrink-0">Schema</TabsTrigger>
        </TabsList>

        {/* ─── Data Sources ─── */}
        <TabsContent value="sources" className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Database Providers</h2>
            <p className="text-sm text-muted-foreground">
              Configure the external database your OneApp connects to. Data is stored persistently outside this project.
            </p>
          </div>

          <div className="space-y-3">
            <SupabaseProviderCard
              connection={connection}
              isLoading={isLoading}
              isTesting={isTesting}
              isSaving={isSaving}
              onTest={testConnection}
              onEdit={() => setShowSetupDialog(true)}
            />
            <AddProviderPlaceholder />
          </div>

          {/* Schema Sync */}
          <SchemaSyncPanel />
        </TabsContent>

        {/* ─── Export / Import ─── */}
        <TabsContent value="export" className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Export & Import</h2>
            <p className="text-sm text-muted-foreground">
              Export table data to CSV or JSON files, or import data from a file into a table.
            </p>
          </div>
          <Card className="p-6 bg-card border-border">
            <DataExportPanel />
          </Card>
        </TabsContent>

        {/* ─── Backup & Restore ─── */}
        <TabsContent value="backup" className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Backup & Restore</h2>
            <p className="text-sm text-muted-foreground">
              Create a full database snapshot or restore from a previous backup file.
            </p>
          </div>
          <Card className="p-6 bg-card border-border">
            <DataBackupPanel />
          </Card>
        </TabsContent>

        {/* ─── Schema ─── */}
        <TabsContent value="schema" className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Database Schema</h2>
            <p className="text-sm text-muted-foreground">
              View and validate the current database schema.
            </p>
          </div>
          <SchemaSection />
        </TabsContent>
      </Tabs>

      {/* Setup Connection Dialog */}
      <SetupConnectionDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        initialUrl={connection?.supabase_url || ""}
        initialKey={connection?.supabase_anon_key || ""}
        initialServiceKey={connection?.supabase_service_key || ""}
        onSave={saveConnection}
        onTest={testConnection}
        isSaving={isSaving}
        isTesting={isTesting}
      />
    </div>
  );
}
