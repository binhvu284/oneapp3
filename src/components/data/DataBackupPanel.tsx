import { useState, useCallback } from "react";
import { Download, Upload, RefreshCw, Database, CheckCircle, AlertCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Tables to include in backup (ordered to respect FK constraints on restore)
const BACKUP_TABLES = [
    "oneapp_users",
    "user_roles",
    "user_sessions",
    "partner_keys",
    "verified_emails",
    "system_connection",
    "user_settings",
    "user_api_keys",
    "ai_agents",
    "ai_conversations",
    "ai_messages",
    "ai_agent_memory",
    "notes",
    "note_folders",
    "note_tags",
    "note_tag_links",
    "note_items",
    "tasks",
    "files",
    "apis",
    "categories",
    "in_use_apps",
    "crypto_holdings",
    "crypto_transactions",
    "crypto_watchlist",
];

interface BackupEntry {
    id: string;
    createdAt: string;
    tables: string[];
    totalRows: number;
    sizeKb: number;
    filename: string;
}

function getLocalBackups(): BackupEntry[] {
    try {
        return JSON.parse(localStorage.getItem("oneapp_backup_history") || "[]");
    } catch {
        return [];
    }
}

function saveLocalBackup(entry: BackupEntry) {
    const existing = getLocalBackups();
    // Keep last 10 entries
    const updated = [entry, ...existing].slice(0, 10);
    localStorage.setItem("oneapp_backup_history", JSON.stringify(updated));
}

function removeLocalBackup(id: string) {
    const existing = getLocalBackups();
    localStorage.setItem("oneapp_backup_history", JSON.stringify(existing.filter(e => e.id !== id)));
}

function formatSize(kb: number): string {
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

export function DataBackupPanel() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupProgress, setBackupProgress] = useState<string>("");
    const [history, setHistory] = useState<BackupEntry[]>(getLocalBackups);

    const handleBackup = useCallback(async () => {
        setIsBackingUp(true);
        const backup: Record<string, unknown[]> = {};
        let totalRows = 0;
        const successTables: string[] = [];

        try {
            for (const table of BACKUP_TABLES) {
                setBackupProgress(`Backing up ${table}...`);
                try {
                    const { data, error } = await supabase
                        .from(table as any)
                        .select("*");

                    if (error) {
                        console.warn(`[Backup] Skipping ${table}:`, error.message);
                        continue;
                    }

                    backup[table] = data || [];
                    totalRows += (data?.length || 0);
                    successTables.push(table);
                } catch {
                    console.warn(`[Backup] Error backing up ${table}`);
                }
            }

            const backupData = {
                version: "1.0",
                created_at: new Date().toISOString(),
                source: "oneapp-backup",
                tables: successTables,
                total_rows: totalRows,
                data: backup,
            };

            const json = JSON.stringify(backupData, null, 2);
            const sizeKb = new Blob([json]).size / 1024;
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
            const filename = `oneapp_backup_${timestamp}.json`;

            // Download file
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Save to history
            const entry: BackupEntry = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                tables: successTables,
                totalRows,
                sizeKb,
                filename,
            };
            saveLocalBackup(entry);
            setHistory(getLocalBackups());

            toast.success(`Backup complete: ${totalRows} rows from ${successTables.length} tables`);
        } catch (err: any) {
            toast.error(`Backup failed: ${err.message}`);
        } finally {
            setIsBackingUp(false);
            setBackupProgress("");
        }
    }, []);

    const handleRestore = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setIsRestoring(true);

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (!backupData.data || !backupData.tables) {
                throw new Error("Invalid backup file format");
            }

            let totalRestored = 0;
            let totalFailed = 0;

            for (const table of backupData.tables) {
                const rows = backupData.data[table];
                if (!rows || rows.length === 0) continue;

                setBackupProgress(`Restoring ${table} (${rows.length} rows)...`);

                // Restore in batches
                for (let i = 0; i < rows.length; i += 50) {
                    const batch = rows.slice(i, i + 50);
                    const { error } = await supabase
                        .from(table as any)
                        .upsert(batch as any, { onConflict: "id" });

                    if (error) {
                        console.warn(`[Restore] Error in ${table}:`, error.message);
                        totalFailed += batch.length;
                    } else {
                        totalRestored += batch.length;
                    }
                }
            }

            if (totalRestored > 0) {
                toast.success(`Restored ${totalRestored} rows successfully`);
            }
            if (totalFailed > 0) {
                toast.error(`${totalFailed} rows failed to restore`);
            }
        } catch (err: any) {
            toast.error(`Restore failed: ${err.message}`);
        } finally {
            setIsRestoring(false);
            setBackupProgress("");
            e.target.value = "";
        }
    }, []);

    const handleDeleteHistory = useCallback((id: string) => {
        removeLocalBackup(id);
        setHistory(getLocalBackups());
    }, []);

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="gap-2"
                >
                    {isBackingUp ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    Create Backup
                </Button>

                <div>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleRestore}
                        className="hidden"
                        id="restore-file-input"
                        disabled={isRestoring}
                    />
                    <Button
                        variant="outline"
                        onClick={() => document.getElementById("restore-file-input")?.click()}
                        disabled={isRestoring}
                        className="gap-2"
                    >
                        {isRestoring ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        Restore from File
                    </Button>
                </div>
            </div>

            {/* Progress */}
            {(isBackingUp || isRestoring) && backupProgress && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {backupProgress}
                </div>
            )}

            {/* Backup scope info */}
            <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Backup includes {BACKUP_TABLES.length} tables</p>
                <p>Creates a full JSON snapshot of all data. Restore uses UPSERT (will overwrite existing rows with same ID).</p>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Backup History (local)</h3>
                    <div className="space-y-2">
                        {history.map(entry => (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Database className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-foreground">{entry.filename}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(entry.createdAt)}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] py-0 h-4">{entry.totalRows} rows</Badge>
                                            <Badge variant="outline" className="text-[10px] py-0 h-4">{formatSize(entry.sizeKb)}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteHistory(entry.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Note: History is stored locally in browser. Download files are the actual backups.</p>
                </div>
            )}
        </div>
    );
}
