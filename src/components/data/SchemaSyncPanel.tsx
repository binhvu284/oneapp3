/**
 * Schema Sync Panel Component
 * 
 * Displays schema validation status and provides actions
 * for validating and migrating database schemas.
 */

import { useState, useEffect, useCallback } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  ArrowRight,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  AlertTriangle,
  Upload,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useActiveDataSource, useDataSources } from "@/lib/data-layer";
import { ONEAPP_SCHEMA_VERSION } from "@/lib/data-layer/schema";
import { SchemaValidationResult } from "@/lib/data-layer/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SchemaSyncPanelProps {
  className?: string;
}

export function SchemaSyncPanel({ className }: SchemaSyncPanelProps) {
  const { source, isConnected, sourceName, sourceType } = useActiveDataSource();
  const { validateSourceSchema, migrateSourceSchema, sources: dataSources } = useDataSources();
  
  const [validationResult, setValidationResult] = useState<SchemaValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSQLDialog, setShowSQLDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validate schema when source changes
  const validateSchema = useCallback(async () => {
    if (!source?.config.id || !isConnected) return;
    
    setIsValidating(true);
    try {
      const result = await validateSourceSchema(source.config.id);
      setValidationResult(result);
      setLastValidated(new Date());
    } catch (error) {
      console.error("[SchemaSyncPanel] Validation error:", error);
      toast.error("Failed to validate schema");
    } finally {
      setIsValidating(false);
    }
  }, [source?.config.id, isConnected, validateSourceSchema]);

  // Sync schema to external database (when viewing external source with issues)
  const syncSchema = useCallback(async () => {
    if (!source?.config.id || !isConnected || !validationResult) return;
    
    setIsSyncing(true);
    try {
      const result = await migrateSourceSchema(source.config.id, validationResult);
      
      if (result.success) {
        toast.success("Schema synchronized successfully!");
        // Re-validate to confirm
        await validateSchema();
      } else if (result.needsManualExecution) {
        // Show SQL dialog for manual execution
        setShowSQLDialog(true);
        toast.info("Manual execution required - copy the SQL and run it in your database");
      } else {
        toast.error(result.error?.message || "Failed to sync schema");
      }
    } catch (error) {
      console.error("[SchemaSyncPanel] Sync error:", error);
      toast.error("Failed to sync schema");
    } finally {
      setIsSyncing(false);
    }
  }, [source?.config.id, isConnected, validationResult, migrateSourceSchema, validateSchema]);

  // Sync schema FROM Lovable Cloud TO External Supabase
  const syncToExternal = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Find external supabase source
      const externalSource = dataSources.find(s => s.config.type === 'supabase');
      
      if (!externalSource) {
        toast.error("No External Supabase connection found. Please set up connection first.");
        return;
      }
      
      // First validate external source schema
      const externalValidation = await validateSourceSchema(externalSource.config.id);
      
      if (externalValidation.isValid) {
        toast.success("External database schema is already up to date!");
        return;
      }
      
      // Now run migration on external source
      const result = await migrateSourceSchema(externalSource.config.id, externalValidation);
      
      if (result.success) {
        toast.success("Schema synced to External Supabase successfully!");
      } else if (result.needsManualExecution) {
        // Store the migration SQL for display
        setValidationResult(prev => prev ? { ...prev, migrationSQL: externalValidation.migrationSQL } : externalValidation);
        setShowSQLDialog(true);
        toast.info("Manual SQL execution required");
      } else {
        toast.error(result.error?.message || "Failed to sync schema to External Supabase");
      }
    } catch (error) {
      console.error("[SchemaSyncPanel] Sync to external error:", error);
      toast.error("Failed to sync schema to External Supabase");
    } finally {
      setIsSyncing(false);
    }
  }, [dataSources, validateSourceSchema, migrateSourceSchema]);

  // Copy SQL to clipboard
  const copySQL = useCallback(async () => {
    if (!validationResult?.migrationSQL) return;
    
    try {
      await navigator.clipboard.writeText(validationResult.migrationSQL);
      setCopied(true);
      toast.success("SQL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("[SchemaSyncPanel] Copy error:", error);
      toast.error("Failed to copy SQL");
    }
  }, [validationResult?.migrationSQL]);

  // Auto-validate on mount when connected
  useEffect(() => {
    if (isConnected && !validationResult && !isValidating) {
      validateSchema();
    }
  }, [isConnected, validationResult, isValidating, validateSchema]);

  const getStatusIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
    if (!validationResult) {
      return <Database className="h-5 w-5 text-muted-foreground" />;
    }
    if (validationResult.isValid) {
      return <CheckCircle2 className="h-5 w-5 text-primary" />;
    }
    return <AlertCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusText = () => {
    if (isValidating) return "Validating...";
    if (!validationResult) return "Not validated";
    if (validationResult.isValid) return "Schema Valid";
    return "Schema Issues Found";
  };

  const getStatusBadge = () => {
    if (isValidating) {
      return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Checking</Badge>;
    }
    if (!validationResult) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    if (validationResult.isValid) {
      return <Badge variant="outline" className="border-primary/40 text-primary">Valid</Badge>;
    }
    // Count missing columns properly (each entry has multiple columns)
    const missingColumnCount = validationResult.missingColumns?.reduce((acc, entry) => acc + entry.columns.length, 0) || 0;
    const issueCount = 
      (validationResult.missingTables?.length || 0) + 
      missingColumnCount + 
      (validationResult.typeMismatches?.length || 0);
    return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{issueCount} Issues</Badge>;
  };

  const formatLastValidated = () => {
    if (!lastValidated) return null;
    const now = new Date();
    const diff = now.getTime() - lastValidated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return lastValidated.toLocaleTimeString();
  };

  // Count missing columns properly (each entry has multiple columns)
  const getMissingColumnCount = () => {
    return validationResult?.missingColumns?.reduce((acc, entry) => acc + entry.columns.length, 0) || 0;
  };

  const totalIssues = validationResult 
    ? (validationResult.missingTables?.length || 0) + 
      getMissingColumnCount() + 
      (validationResult.typeMismatches?.length || 0)
    : 0;

  // Check if this is an external source that can be synced (has issues)
  const canSyncExternal = sourceType === 'supabase' && totalIssues > 0 && !isValidating && !isSyncing;
  
  // Check if we can sync FROM Lovable Cloud TO External (always available when viewing Lovable Cloud and connected to external)
  const canSyncToExternal = sourceType === 'lovable' && isConnected && !isValidating && !isSyncing;

  return (
    <>
      <Card className={cn("p-5 bg-card border-border", className)}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Schema Sync Status</h3>
                <p className="text-xs text-muted-foreground">
                  OneApp Schema v{ONEAPP_SCHEMA_VERSION}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          <Separator />

          {/* Current Source Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Active Source:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{sourceName}</span>
              {sourceType && (
                <Badge variant="outline" className="text-xs">
                  {sourceType}
                </Badge>
              )}
            </div>
          </div>

          {/* Status Row */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium">{getStatusText()}</p>
                {lastValidated && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatLastValidated()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={validateSchema}
                disabled={!isConnected || isValidating}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isValidating && "animate-spin")} />
                {isValidating ? "Validating..." : "Validate"}
              </Button>
            </div>
          </div>

          {/* Sync Button - Only show for external sources with issues */}
          {canSyncExternal && (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={syncSchema}
                disabled={isSyncing}
                className="gap-2 flex-1"
              >
                <Upload className={cn("h-4 w-4", isSyncing && "animate-pulse")} />
                {isSyncing ? "Syncing Schema..." : "Sync Schema Now"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSQLDialog(true)}
                disabled={!validationResult?.migrationSQL}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                View SQL
              </Button>
            </div>
          )}
          
          {/* Sync to External button - Show when viewing Lovable Cloud */}
          {canSyncToExternal && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Sync to External Database</p>
                <p className="text-xs text-muted-foreground">Push OneApp schema to External Supabase</p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={syncToExternal}
                disabled={isSyncing}
                className="gap-2"
              >
                <Upload className={cn("h-4 w-4", isSyncing && "animate-pulse")} />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          )}

          {/* Validation Details */}
          {validationResult && totalIssues > 0 && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between hover:bg-muted/50"
                >
                  <span className="text-sm">View {totalIssues} Schema Differences</span>
                  {showDetails ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ScrollArea className="h-48 rounded-lg border bg-muted/30 p-3">
                  <div className="space-y-3 text-sm">
                    {/* Missing Tables */}
                    {validationResult.missingTables?.length > 0 && (
                      <div>
                        <p className="font-medium text-destructive mb-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Missing Tables ({validationResult.missingTables.length})
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-1">
                          {validationResult.missingTables.map(table => (
                            <li key={table}><code className="text-xs">{table}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Missing Columns */}
                    {validationResult.missingColumns?.length > 0 && (
                      <div>
                        <p className="font-medium text-warning mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Missing Columns ({getMissingColumnCount()})
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-1">
                          {validationResult.missingColumns.map((entry) => (
                            <li key={entry.table}>
                              <code className="text-xs">{entry.table}</code>
                              <span className="text-xs text-muted-foreground ml-1">
                                ({entry.columns.join(", ")})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Type Mismatches */}
                    {validationResult.typeMismatches?.length > 0 && (
                      <div>
                        <p className="font-medium text-primary mb-1 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          Type Mismatches ({validationResult.typeMismatches.length})
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-0.5 ml-1">
                          {validationResult.typeMismatches.map((m, i) => (
                            <li key={i}>
                              <code className="text-xs">{m.table}.{m.column}</code>
                              <span className="text-xs ml-1">
                                {m.actual} → {m.expected}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Valid Schema Message */}
          {validationResult?.isValid && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <p className="text-sm text-primary">
                All OneApp tables and columns are present and correctly typed.
              </p>
            </div>
          )}

          {/* Not Connected Warning */}
          {!isConnected && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-sm text-warning">
                Connect to a data source to validate schema.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* SQL Dialog for Manual Execution */}
      <Dialog open={showSQLDialog} onOpenChange={setShowSQLDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Migration SQL
            </DialogTitle>
            <DialogDescription>
              Copy this SQL and execute it in your External Supabase SQL Editor to sync the schema.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-96 rounded-lg border bg-muted/30">
            <Textarea
              value={validationResult?.migrationSQL || '-- No migration needed'}
              readOnly
              className="min-h-[360px] font-mono text-xs bg-transparent border-0 resize-none"
            />
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSQLDialog(false)}>
              Close
            </Button>
            <Button onClick={copySQL} className="gap-2">
              {copied ? (
                <>
                  <CheckCheck className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy SQL
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
