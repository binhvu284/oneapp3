import { useState, useRef } from "react";
import { Play, Clock, AlertCircle, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { quickQuery } from "@/lib/onecommand-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HISTORY_KEY = "onecommand_query_history";
const MAX_HISTORY = 20;

interface HistoryEntry {
  sql: string;
  timestamp: number;
  rowCount: number;
}

function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

interface QueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
  row_count: number;
  latency_ms: number;
}

interface QueryRunnerProps {
  initialSql?: string;
}

export function QueryRunner({ initialSql = "" }: QueryRunnerProps) {
  const [sql, setSql] = useState(initialSql);
  const [allowMutations, setAllowMutations] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function runQuery() {
    if (!sql.trim()) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await quickQuery(sql, allowMutations) as QueryResult & { success: boolean };
      setResult(res);

      const entry: HistoryEntry = { sql: sql.trim(), timestamp: Date.now(), rowCount: res.row_count };
      const next = [entry, ...history.filter((h) => h.sql !== sql.trim())];
      setHistory(next);
      saveHistory(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Query failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  function restoreFromHistory(entry: HistoryEntry) {
    setSql(entry.sql);
    setShowHistory(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Editor */}
      <div className="flex flex-col gap-2">
        <Textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder="SELECT * FROM notes LIMIT 10;"
          className="min-h-[120px] resize-y font-mono text-xs leading-relaxed"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              runQuery();
            }
          }}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="allow-mutations"
                checked={allowMutations}
                onCheckedChange={setAllowMutations}
              />
              <Label htmlFor="allow-mutations" className="text-xs text-muted-foreground cursor-pointer">
                {allowMutations ? <ToggleRight className="inline h-3 w-3 mr-1" /> : <ToggleLeft className="inline h-3 w-3 mr-1" />}
                Allow mutations
              </Label>
            </div>
            {allowMutations && (
              <Badge variant="destructive" className="text-[10px]">Mutations enabled</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => setShowHistory((v) => !v)}
            >
              <Clock className="h-3 w-3 mr-1" />
              History ({history.length})
            </Button>
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={runQuery}
              disabled={isRunning || !sql.trim()}
            >
              <Play className="h-3 w-3 mr-1" />
              {isRunning ? "Running…" : "Run"}
              <span className="ml-1 text-[10px] opacity-60">⌘↵</span>
            </Button>
          </div>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground">Query history</span>
            {history.length > 0 && (
              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={clearHistory}>
                <Trash2 className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No queries yet.</p>
          ) : (
            <ul className="flex flex-col gap-1 max-h-[140px] overflow-y-auto">
              {history.map((h, i) => (
                <li key={i}>
                  <button
                    onClick={() => restoreFromHistory(h)}
                    className="w-full text-left rounded px-2 py-1 hover:bg-accent text-xs font-mono text-muted-foreground truncate"
                  >
                    {h.sql}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap break-words">{error}</pre>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{result.row_count} row{result.row_count !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{result.latency_ms}ms</span>
          </div>

          {result.rows.length === 0 ? (
            <p className="text-xs text-muted-foreground">Query returned 0 rows.</p>
          ) : (
            <div className="overflow-auto rounded-md border border-border flex-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 sticky top-0">
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left font-medium text-foreground border-b border-border whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={cn("border-b border-border/50", i % 2 === 0 ? "" : "bg-muted/20")}
                    >
                      {result.columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-1.5 text-muted-foreground max-w-[240px] truncate"
                          title={String(row[col] ?? "")}
                        >
                          {row[col] === null ? (
                            <span className="text-muted-foreground/40 italic">null</span>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
