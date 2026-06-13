import { useEffect, useState, useCallback, useMemo } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import {
    Laptop, Moon, Sun, MonitorPlay, Sparkles, Database,
    Code, Shield, Bitcoin, StickyNote, LayoutDashboard, Search,
    Terminal, GitPullRequest, Rocket, Play, ServerCog, HardDriveDownload,
    FilePlus, CheckSquare
} from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FF_ONECOMMAND } from "@/lib/feature-flags";
import { parseCommandPrefix } from "@/lib/onecommand-utils";
import { useDataQuery } from "@/lib/data-layer";
import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataInsert } from "@/lib/data-layer";
import { toast } from "sonner";

const ITEM_CLS =
    "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors";

interface SearchNote { id: string; title: string; }
interface SearchTask { id: string; title: string; }

export function GlobalCommandMenu() {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const navigate = useNavigate();
    const { setTheme } = useTheme();
    const { user } = useAuthSafe();
    const insertNote = useDataInsert("notes");

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = useCallback((command: () => unknown) => {
        setOpen(false);
        setInputValue("");
        command();
    }, []);

    // Full-text search: only fires for >= 3 chars, no active prefix command
    const parsed = inputValue.length >= 2 ? parseCommandPrefix(inputValue) : null;
    const isPrefix = !!parsed;
    const searchTerm = !isPrefix && inputValue.length >= 3 ? inputValue : "";

    const notesQuery = useDataQuery<SearchNote>("notes", {
        queryOptions: {
            select: ["id", "title"],
            filters: [
                { column: "title", operator: "ilike", value: `%${searchTerm}%` },
                { column: "user_id", operator: "eq", value: user?.id ?? "" },
            ],
            limit: 5,
        },
        enabled: !!user && searchTerm.length >= 3,
    });

    const tasksQuery = useDataQuery<SearchTask>("note_items", {
        queryOptions: {
            select: ["id", "title"],
            filters: [
                { column: "title", operator: "ilike", value: `%${searchTerm}%` },
                { column: "user_id", operator: "eq", value: user?.id ?? "" },
            ],
            limit: 5,
        },
        enabled: !!user && searchTerm.length >= 3,
    });

    const notes: SearchNote[] = (notesQuery.data?.data as SearchNote[] | null) ?? [];
    const tasks: SearchTask[] = (tasksQuery.data?.data as SearchTask[] | null) ?? [];

    async function handleCreateNote(title: string) {
        if (!user || !title.trim()) return;
        try {
            await insertNote.mutateAsync({ data: { title: title.trim(), user_id: user.id } });
            toast.success(`Note created: "${title.trim()}"`);
            navigate("/apps/onenote");
        } catch {
            toast.error("Failed to create note");
        }
    }

    const prefixMode = parsed?.prefix;
    const prefixRest = parsed?.rest ?? "";

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setInputValue(""); }}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl border-border bg-background max-w-2xl sm:rounded-xl">
                <Command
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 flex h-full w-full flex-col bg-transparent max-h-[60vh] overflow-hidden"
                    shouldFilter={!isPrefix && searchTerm.length < 3}
                >
                    <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-foreground" />
                        <Command.Input
                            value={inputValue}
                            onValueChange={setInputValue}
                            placeholder={FF_ONECOMMAND ? "Type a command, note:, task:, query:, pr, deploy…" : "Type a command or search…"}
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                        />
                    </div>
                    <Command.List className="max-h-[380px] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        {/* ── Prefix-command shortcuts ── */}
                        {FF_ONECOMMAND && prefixMode === "note" && (
                            <Command.Group heading="Create Note">
                                <Command.Item
                                    className={ITEM_CLS}
                                    onSelect={() => runCommand(() => handleCreateNote(prefixRest || "Untitled"))}
                                >
                                    <FilePlus className="mr-2 h-4 w-4 text-yellow-400" />
                                    <span>Create note: <strong>{prefixRest || "Untitled"}</strong></span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {FF_ONECOMMAND && prefixMode === "task" && (
                            <Command.Group heading="Create Task">
                                <Command.Item
                                    className={ITEM_CLS}
                                    onSelect={() => runCommand(() => navigate("/apps/onenote"))}
                                >
                                    <CheckSquare className="mr-2 h-4 w-4 text-green-400" />
                                    <span>Create task: <strong>{prefixRest || "…"}</strong></span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {FF_ONECOMMAND && prefixMode === "query" && (
                            <Command.Group heading="Quick Query">
                                <Command.Item
                                    className={ITEM_CLS}
                                    onSelect={() =>
                                        runCommand(() =>
                                            navigate(`/apps/onecommand?tab=query&sql=${encodeURIComponent(prefixRest)}`)
                                        )
                                    }
                                >
                                    <Play className="mr-2 h-4 w-4 text-primary" />
                                    <span>Run query: <code className="text-xs bg-muted px-1 rounded">{prefixRest || "…"}</code></span>
                                </Command.Item>
                            </Command.Group>
                        )}

                        {/* ── Full-text search results ── */}
                        {!isPrefix && searchTerm.length >= 3 && notes.length > 0 && (
                            <Command.Group heading="Notes">
                                {notes.map((n) => (
                                    <Command.Item
                                        key={n.id}
                                        className={ITEM_CLS}
                                        onSelect={() => runCommand(() => navigate("/apps/onenote"))}
                                    >
                                        <StickyNote className="mr-2 h-4 w-4 text-yellow-400" />
                                        <span>{n.title}</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {!isPrefix && searchTerm.length >= 3 && tasks.length > 0 && (
                            <Command.Group heading="Tasks">
                                {tasks.map((t) => (
                                    <Command.Item
                                        key={t.id}
                                        className={ITEM_CLS}
                                        onSelect={() => runCommand(() => navigate("/apps/onenote"))}
                                    >
                                        <CheckSquare className="mr-2 h-4 w-4 text-green-400" />
                                        <span>{t.title}</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* ── Default groups (shown when no prefix / short search) ── */}
                        {(!isPrefix || (isPrefix && !["note", "task", "query"].includes(prefixMode ?? ""))) && (
                            <>
                                <Command.Group heading="Apps & Modules" className="text-xs">
                                    <Command.Item onSelect={() => runCommand(() => navigate("/"))} className={ITEM_CLS}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => navigate("/library"))} className={ITEM_CLS}>
                                        <MonitorPlay className="mr-2 h-4 w-4" />
                                        <span>OneLibrary</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => navigate("/developing/ai"))} className={ITEM_CLS}>
                                        <Sparkles className="mr-2 h-4 w-4 text-cyan-400" />
                                        <span>OneApp AI</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => navigate("/apps/crypto"))} className={ITEM_CLS}>
                                        <Bitcoin className="mr-2 h-4 w-4 text-orange-400" />
                                        <span>OneCrypto</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => navigate("/apps/onenote"))} className={ITEM_CLS}>
                                        <StickyNote className="mr-2 h-4 w-4 text-yellow-400" />
                                        <span>OneNote</span>
                                    </Command.Item>
                                    {FF_ONECOMMAND && (
                                        <Command.Item
                                            onSelect={() => runCommand(() => navigate("/apps/onecommand"))}
                                            className={ITEM_CLS}
                                        >
                                            <Terminal className="mr-2 h-4 w-4 text-primary" />
                                            <span>OneCommand</span>
                                        </Command.Item>
                                    )}
                                </Command.Group>

                                <Command.Separator className="h-px bg-border my-2" />

                                <Command.Group heading="Workspace" className="text-xs">
                                    <Command.Item onSelect={() => runCommand(() => navigate("/developing/data"))} className={ITEM_CLS}>
                                        <Database className="mr-2 h-4 w-4" />
                                        <span>OneApp Data</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => navigate("/workspace/developer"))} className={ITEM_CLS}>
                                        <Code className="mr-2 h-4 w-4" />
                                        <span>OneApp Developer</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => navigate("/customization/admin"))} className={ITEM_CLS}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>System Admin</span>
                                    </Command.Item>
                                </Command.Group>

                                {FF_ONECOMMAND && (
                                    <>
                                        <Command.Separator className="h-px bg-border my-2" />
                                        <Command.Group heading="OneCommand" className="text-xs">
                                            <Command.Item
                                                onSelect={() => runCommand(() => navigate("/apps/onecommand?tab=github"))}
                                                className={ITEM_CLS}
                                            >
                                                <GitPullRequest className="mr-2 h-4 w-4 text-primary" />
                                                <span>pr — Open GitHub PRs</span>
                                            </Command.Item>
                                            <Command.Item
                                                onSelect={() => runCommand(() => navigate("/apps/onecommand?tab=vercel"))}
                                                className={ITEM_CLS}
                                            >
                                                <Rocket className="mr-2 h-4 w-4 text-primary" />
                                                <span>deploy — Vercel deployment view</span>
                                            </Command.Item>
                                            <Command.Item
                                                onSelect={() => runCommand(() => navigate("/apps/onecommand?tab=query"))}
                                                className={ITEM_CLS}
                                            >
                                                <Play className="mr-2 h-4 w-4 text-primary" />
                                                <span>query: — Open SQL query runner</span>
                                            </Command.Item>
                                            <Command.Item
                                                onSelect={() => runCommand(() => navigate("/developing/data"))}
                                                className={ITEM_CLS}
                                            >
                                                <ServerCog className="mr-2 h-4 w-4" />
                                                <span>switch db — Database settings</span>
                                            </Command.Item>
                                            <Command.Item
                                                onSelect={() => runCommand(() => navigate("/developing/data"))}
                                                className={ITEM_CLS}
                                            >
                                                <HardDriveDownload className="mr-2 h-4 w-4" />
                                                <span>backup — Trigger database backup</span>
                                            </Command.Item>
                                        </Command.Group>
                                    </>
                                )}

                                <Command.Separator className="h-px bg-border my-2" />

                                <Command.Group heading="Theme" className="text-xs">
                                    <Command.Item onSelect={() => runCommand(() => setTheme("light"))} className={ITEM_CLS}>
                                        <Sun className="mr-2 h-4 w-4" />
                                        <span>Light Theme</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => setTheme("dark"))} className={ITEM_CLS}>
                                        <Moon className="mr-2 h-4 w-4" />
                                        <span>Dark Theme</span>
                                    </Command.Item>
                                    <Command.Item onSelect={() => runCommand(() => setTheme("system"))} className={ITEM_CLS}>
                                        <Laptop className="mr-2 h-4 w-4" />
                                        <span>System Theme</span>
                                    </Command.Item>
                                </Command.Group>
                            </>
                        )}
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
