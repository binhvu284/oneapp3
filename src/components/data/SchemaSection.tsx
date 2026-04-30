import { useState } from "react";
import { ChevronDown, ChevronRight, Table2, Code, Download, Copy, Check, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  generateSQLForContext, 
  getTableSummary, 
  getCategoryBadge,
  ONEAPP_SCHEMA_VERSION,
  type SchemaContext,
  type TableCategory
} from "@/lib/schemaGenerator";
import { useSystemConnection } from "@/hooks/useSystemConnection";

type SchemaView = "list" | "sql";

const CONTEXT_LABELS: Record<SchemaContext, string> = {
  all: "All Tables",
  external: "External Database",
  lovable: "Lovable Cloud"
};

const getContextDescription = (context: SchemaContext, tableCount: number, hasExternalConnection: boolean): string => {
  return `${tableCount} tables - v${ONEAPP_SCHEMA_VERSION}`;
};

export function SchemaSection() {
  const [schemaView, setSchemaView] = useState<SchemaView>("list");
  const [schemaContext, setSchemaContext] = useState<SchemaContext>("lovable");
  const [expandedTables, setExpandedTables] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Check external connection status
  const { connection, isLovableCloudActive } = useSystemConnection();
  const hasExternalConnection = connection?.connection_status === "connected";

  const tables = getTableSummary(schemaContext);
  const sqlSchema = generateSQLForContext(schemaContext);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema);
      setCopied(true);
      toast.success("SQL schema copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy schema");
    }
  };

  const handleDownloadSQL = () => {
    const contextSuffix = schemaContext === 'all' ? '' : `-${schemaContext}`;
    const blob = new Blob([sqlSchema], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oneapp-schema${contextSuffix}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Schema downloaded!");
  };

  const getCategoryBadgeVariant = (category: TableCategory) => {
    const badge = getCategoryBadge(category);
    return badge;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Schema</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Copy this SQL to create matching tables in external Supabase projects
            </p>
          </div>
          
          {/* Context Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 min-w-[160px] justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{CONTEXT_LABELS[schemaContext]}</span>
                  <span className="sm:hidden">Filter</span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {(Object.keys(CONTEXT_LABELS) as SchemaContext[]).map((ctx) => {
                const ctxTables = getTableSummary(ctx);
                return (
                  <DropdownMenuItem 
                    key={ctx}
                    onClick={() => setSchemaContext(ctx)}
                    className="flex flex-col items-start gap-1 py-2"
                    disabled={false}
                  >
                    <span className="font-medium">{CONTEXT_LABELS[ctx]}</span>
                    <span className="text-xs text-muted-foreground">
                      {getContextDescription(ctx, ctxTables.length, hasExternalConnection)}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={schemaView === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSchemaView("list")}
            className="gap-2"
          >
            <Table2 className="w-4 h-4" />
            <span className="hidden sm:inline">List Structure</span>
            <span className="sm:hidden">List</span>
          </Button>
          <Button 
            variant={schemaView === "sql" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSchemaView("sql")}
            className="gap-2"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">SQL Code</span>
            <span className="sm:hidden">SQL</span>
          </Button>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 data-[copied=true]:text-primary"
            onClick={handleCopySQL}
            data-copied={copied}
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy SQL"}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleDownloadSQL}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Connection status info */}
      {schemaContext === 'external' && !hasExternalConnection && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-muted/50 rounded-lg border border-border">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">No External Connection Active</p>
            <p className="text-xs text-muted-foreground">
              You can still copy the SQL schema below and paste it into your external Supabase project.
            </p>
          </div>
        </div>
      )}

      {/* Table count summary */}
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <span>{tables.length} tables</span>
        <span>•</span>
        <span className="text-xs">
          {schemaContext === 'external' && "For creating tables in your external Supabase project"}
          {schemaContext === 'lovable' && "Tables managed by Lovable Cloud"}
          {schemaContext === 'all' && "Complete schema across all environments"}
        </span>
      </div>

      {schemaView === "list" ? (
        <div className="space-y-2">
          {tables.map((table) => {
            const badge = getCategoryBadgeVariant(table.category);
            return (
              <Collapsible key={table.name} open={expandedTables.includes(table.name)}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => toggleTable(table.name)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium font-mono text-sm">{table.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({table.columnCount} columns)
                    </span>
                    {schemaContext === 'all' && (
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                  {expandedTables.includes(table.name) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 py-3 bg-muted/30 rounded-b-lg mt-1">
                  {table.description && (
                    <p className="text-sm text-muted-foreground mb-3 italic">
                      {table.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {table.columns.map((col) => (
                      <div 
                        key={col} 
                        className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded truncate"
                        title={col}
                      >
                        {col}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        <div className="relative">
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="text-muted-foreground whitespace-pre-wrap">
              {sqlSchema}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
}
