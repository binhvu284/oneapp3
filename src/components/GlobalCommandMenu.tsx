import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import {
    Laptop, Moon, Sun, MonitorPlay, Sparkles, Database,
    Code, Shield, Bitcoin, StickyNote, LayoutDashboard, Search
} from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GlobalCommandMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        const handleQuickAction = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;
            if (detail === "open-command-palette") setOpen(true);
        };

        document.addEventListener("keydown", down);
        window.addEventListener("oneapp:quick-action", handleQuickAction);
        return () => {
            document.removeEventListener("keydown", down);
            window.removeEventListener("oneapp:quick-action", handleQuickAction);
        };
    }, []);

    const runCommand = useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl border-border bg-background max-w-2xl sm:rounded-xl">
                <Command
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 flex h-full w-full flex-col bg-transparent max-h-[60vh] overflow-hidden"
                >
                    <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-foreground" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>
                        <Command.Group heading="Apps & Modules" className="text-xs">
                            <Command.Item onSelect={() => runCommand(() => navigate("/"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate("/library"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <MonitorPlay className="mr-2 h-4 w-4" />
                                <span>OneLibrary</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate("/developing/ai"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Sparkles className="mr-2 h-4 w-4 text-cyan-400" />
                                <span>OneApp AI</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate("/apps/crypto"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Bitcoin className="mr-2 h-4 w-4 text-orange-400" />
                                <span>OneCrypto</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate("/apps/onenote"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <StickyNote className="mr-2 h-4 w-4 text-yellow-400" />
                                <span>OneNote</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="h-px bg-border my-2" />

                        <Command.Group heading="Workspace" className="text-xs">
                            <Command.Item onSelect={() => runCommand(() => navigate("/developing/data"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Database className="mr-2 h-4 w-4" />
                                <span>OneApp Data</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate("/workspace/developer"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Code className="mr-2 h-4 w-4" />
                                <span>OneApp Developer</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => navigate("/customization/admin"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Shield className="mr-2 h-4 w-4" />
                                <span>System Admin</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="h-px bg-border my-2" />

                        <Command.Group heading="Theme" className="text-xs">
                            <Command.Item onSelect={() => runCommand(() => setTheme("light"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Light Theme</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setTheme("dark"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Dark Theme</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setTheme("system"))} className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 transition-colors">
                                <Laptop className="mr-2 h-4 w-4" />
                                <span>System Theme</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
