import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, Sliders, Trash2, MoreVertical, Link2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { IntegratedApp } from "@/config/integratedApps";
import { AppConnection } from "@/hooks/useIntegratedApps";

interface IntegratedAppCardProps {
    app: IntegratedApp;
    connection?: AppConnection;
    onConnect: (appId: string, credentials: Record<string, string>) => Promise<boolean>;
    onUpdate: (appId: string, credentials: Record<string, string>) => Promise<boolean>;
    onDisconnect: (appId: string) => void;
}

export function IntegratedAppCard({
    app, connection, onConnect, onUpdate, onDisconnect
}: IntegratedAppCardProps) {
    const isConnected = connection?.status === "connected";
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"connect" | "update">("connect");
    const [credentials, setCredentials] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const Icon = app.icon;

    const openDialog = (mode: "connect" | "update") => {
        setDialogMode(mode);
        if (mode === "update" && connection?.credentials) {
            setCredentials(connection.credentials);
        } else {
            setCredentials({});
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (dialogMode === "connect") {
                await onConnect(app.id, credentials);
            } else {
                await onUpdate(app.id, credentials);
            }
            setIsDialogOpen(false);
        } catch (error) {
            // Error handling is managed by the hook (toast)
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenApp = () => {
        import("sonner").then(({ toast }) => {
            toast.info(`Opening ${app.name} interface... (Coming soon)`);
        });
    };

    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            "w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden",
                            !app.logoBg && "bg-primary/20"
                        )}
                        style={app.logoBg ? { backgroundColor: app.logoBg } : {}}
                    >
                        {app.logoUrl ? (
                            <img src={app.logoUrl} alt={app.name} className="w-9 h-9 object-contain p-1" />
                        ) : (
                            <Icon className="w-6 h-6 text-primary" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                            {app.name}
                            <Badge variant="outline" className="text-xs font-normal">{app.category}</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{app.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge className={cn("border-0 p-1.5 px-3", isConnected ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-muted text-muted-foreground hover:bg-muted")}>
                        <div className={cn("w-1.5 h-1.5 rounded-full mr-2", isConnected ? "bg-green-500" : "bg-muted-foreground")} />
                        {isConnected ? "Connected" : "Not Connected"}
                    </Badge>

                    {isConnected ? (
                        <div className="flex items-center gap-2">
                            <Button onClick={handleOpenApp} variant="default" size="sm" className="gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Open
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => openDialog("update")} className="gap-2">
                                        <Sliders className="w-4 h-4" />
                                        Update Connection
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDisconnect(app.id)} className="gap-2 text-red-500 focus:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                        Disconnect
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Button onClick={() => openDialog("connect")} variant="default" size="sm" className="gap-2">
                            <Link2 className="w-4 h-4" />
                            Connect
                        </Button>
                    )}
                </div>
            </div>

            {/* Connection Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === "connect" ? "Connect" : "Update"} {app.name}</DialogTitle>
                        <DialogDescription>
                            Enter your API credentials to connect {app.name} to OneApp.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {app.fields.map((field) => (
                            <div key={field.key} className="grid gap-2">
                                <Label htmlFor={field.key}>{field.label}</Label>
                                <Input
                                    id={field.key}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={credentials[field.key] || ""}
                                    onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {dialogMode === "connect" ? "Connect & Save" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
