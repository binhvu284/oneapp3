import { useState, useCallback } from "react";
import { Download, Upload, Table2, FileJson, FileText, RefreshCw, ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Known tables in the schema
const KNOWN_TABLES = [
    "oneapp_users",
    "user_roles",
    "user_sessions",
    "ai_agents",
    "ai_conversations",
    "ai_messages",
    "notes",
    "note_folders",
    "note_tags",
    "note_items",
    "tasks",
    "files",
    "apis",
    "categories",
    "in_use_apps",
    "partner_keys",
    "verified_emails",
    "system_connection",
    "user_settings",
    "user_api_keys",
    "crypto_holdings",
    "crypto_transactions",
    "crypto_watchlist",
];

type ExportFormat = "csv" | "json";

function convertToCSV(data: Record<string, unknown>[]): string {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(","),
        ...data.map(row =>
            headers.map(h => {
                const val = row[h];
                if (val === null || val === undefined) return "";
                const str = typeof val === "object" ? JSON.stringify(val) : String(val);
                // Escape commas, quotes, and newlines
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(",")
        ),
    ];
    return csvRows.join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function DataExportPanel() {
    const [selectedTable, setSelectedTable] = useState<string>("");
    const [format, setFormat] = useState<ExportFormat>("json");
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [rowCount, setRowCount] = useState<number | null>(null);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

    const handleTableSelect = useCallback(async (table: string) => {
        setSelectedTable(table);
        setRowCount(null);
        setImportResult(null);
        try {
            const { count } = await supabase
                .from(table as any)
                .select("*", { count: "exact", head: true });
            setRowCount(count ?? 0);
        } catch {
            setRowCount(0);
        }
    }, []);

    const handleExport = useCallback(async () => {
        if (!selectedTable) return;
        setIsExporting(true);
        try {
            const { data, error } = await supabase
                .from(selectedTable as any)
                .select("*");

            if (error) throw error;
            if (!data || data.length === 0) {
                toast.info("Table is empty, nothing to export");
                return;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
            const filename = `${selectedTable}_${timestamp}`;

            if (format === "json") {
                downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
            } else {
                downloadFile(convertToCSV(data as Record<string, unknown>[]), `${filename}.csv`, "text/csv");
            }

            toast.success(`Exported ${data.length} rows from ${selectedTable}`);
        } catch (err: any) {
            toast.error(`Export failed: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    }, [selectedTable, format]);

    const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedTable || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        setIsImporting(true);
        setImportResult(null);

        try {
            const text = await file.text();
            let rows: Record<string, unknown>[];

            if (file.name.endsWith(".json")) {
                rows = JSON.parse(text);
                if (!Array.isArray(rows)) rows = [rows];
            } else if (file.name.endsWith(".csv")) {
                const lines = text.split("\n").filter(l => l.trim());
                const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
                rows = lines.slice(1).map(line => {
                    const values = line.split(",");
                    return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim().replace(/^"|"$/g, "") || null]));
                });
            } else {
                throw new Error("Only .json and .csv files are supported");
            }

            if (rows.length === 0) {
                toast.info("File is empty");
                return;
            }

            let success = 0, failed = 0;

            // Insert in batches of 50
            for (let i = 0; i < rows.length; i += 50) {
                const batch = rows.slice(i, i + 50);
                const { error } = await supabase
                    .from(selectedTable as any)
                    .upsert(batch as any, { onConflict: "id" });
                if (error) {
                    failed += batch.length;
                } else {
                    success += batch.length;
                }
            }

            setImportResult({ success, failed });
            if (success > 0) toast.success(`Imported ${success} rows into ${selectedTable}`);
            if (failed > 0) toast.error(`${failed} rows failed to import`);

            // Refresh count
            const { count } = await supabase.from(selectedTable as any).select("*", { count: "exact", head: true });
            setRowCount(count ?? 0);
        } catch (err: any) {
            toast.error(`Import failed: ${err.message}`);
        } finally {
            setIsImporting(false);
            e.target.value = "";
        }
    }, [selectedTable]);

    return (
        <div className="space-y-4">
            {/* Table Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Table</label>
                    <Select value={selectedTable} onValueChange={handleTableSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a table..." />
                        </SelectTrigger>
                        <SelectContent>
                            {KNOWN_TABLES.map(t => (
                                <SelectItem key={t} value={t}>
                                    <div className="flex items-center gap-2">
                                        <Table2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        {t}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Format</label>
                    <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="json">
                                <div className="flex items-center gap-2">
                                    <FileJson className="w-3.5 h-3.5" />
                                    JSON
                                </div>
                            </SelectItem>
                            <SelectItem value="csv">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    CSV
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Row count badge */}
            {selectedTable && rowCount !== null && (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        <Table2 className="w-3 h-3 mr-1" />
                        {rowCount} rows
                    </Badge>
                    <span className="text-xs text-muted-foreground">in {selectedTable}</span>
                </div>
            )}

            {/* Import result */}
            {importResult && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    {importResult.success > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {importResult.success} imported
                        </div>
                    )}
                    {importResult.failed > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {importResult.failed} failed
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={handleExport}
                    disabled={!selectedTable || isExporting}
                    className="gap-2"
                >
                    {isExporting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    Export {format.toUpperCase()}
                </Button>

                <div>
                    <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleImport}
                        className="hidden"
                        id="import-file-input"
                        disabled={!selectedTable || isImporting}
                    />
                    <Button
                        variant="outline"
                        onClick={() => document.getElementById("import-file-input")?.click()}
                        disabled={!selectedTable || isImporting}
                        className="gap-2"
                    >
                        {isImporting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        Import File
                    </Button>
                </div>
            </div>

            {!selectedTable && (
                <p className="text-xs text-muted-foreground">Select a table to export or import data</p>
            )}
        </div>
    );
}
