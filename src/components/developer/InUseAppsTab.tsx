import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Trash2, Edit, Plus, Upload, Loader2,
    ExternalLink, RefreshCw, Sliders, MoreVertical, X,
    Search, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AppIcon } from "@/components/icons/AppIcon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { type Category } from "@/hooks/useCategories";
import { type AppStatus, type InUseApp } from "@/hooks/useInUseApps";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusBadgeStyle(status: AppStatus) {
    switch (status) {
        case "available": return "bg-green-500/20 text-green-500 hover:bg-green-500/30";
        case "disable": return "bg-red-500/20 text-red-500 hover:bg-red-500/30";
        case "developing": return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30";
        default: return "bg-muted text-muted-foreground";
    }
}

function getStatusLabel(status: AppStatus) {
    switch (status) {
        case "available": return "Available";
        case "disable": return "Disabled";
        case "developing": return "Developing";
        default: return status;
    }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InUseAppsTabProps {
    apps: InUseApp[];
    isLoading: boolean;
    categories: Category[];
    getCategoryIdsForApp: (appId: string) => string[];
    setAppCategoriesForApp: (appId: string, categoryIds: string[]) => Promise<boolean>;
    updateApp: (id: string, data: any) => Promise<boolean>;
    updateStatus: (id: string, status: AppStatus) => Promise<boolean>;
    searchQuery: string;
    onSearchChange: (q: string) => void;
}

// ─── InUseAppsTab ─────────────────────────────────────────────────────────────

export function InUseAppsTab({
    apps,
    isLoading,
    categories,
    getCategoryIdsForApp,
    setAppCategoriesForApp,
    updateApp,
    updateStatus,
    searchQuery,
    onSearchChange,
}: InUseAppsTabProps) {
    const navigate = useNavigate();

    // Status dialog
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<InUseApp | null>(null);
    const [newStatus, setNewStatus] = useState<AppStatus>("available");

    // Settings dialog
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [settingsApp, setSettingsApp] = useState<InUseApp | null>(null);
    const [editName, setEditName] = useState("");
    const [editShortDesc, setEditShortDesc] = useState("");
    const [editLongDesc, setEditLongDesc] = useState("");
    const [editCategories, setEditCategories] = useState<string[]>([]);

    const getCategoryNamesForApp = (appId: string) => {
        const ids = getCategoryIdsForApp(appId);
        return categories.filter((c) => ids.includes(c.id)).map((c) => c.name);
    };

    const filteredApps = apps.filter(
        (app) =>
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.short_description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenStatus = (app: InUseApp) => {
        setSelectedApp(app);
        setNewStatus(app.status);
        setStatusDialogOpen(true);
    };

    const handleChangeStatus = async () => {
        if (selectedApp) {
            await updateStatus(selectedApp.id, newStatus);
            setStatusDialogOpen(false);
            setSelectedApp(null);
        }
    };

    const handleOpenSettings = (app: InUseApp) => {
        setSettingsApp(app);
        setEditName(app.name);
        setEditShortDesc(app.short_description || "");
        setEditLongDesc(app.long_description || "");
        setEditCategories(getCategoryIdsForApp(app.id));
        setSettingsDialogOpen(true);
    };

    const handleSaveSettings = async () => {
        if (settingsApp) {
            await updateApp(settingsApp.id, {
                name: editName,
                short_description: editShortDesc,
                long_description: editLongDesc,
            });
            await setAppCategoriesForApp(settingsApp.id, editCategories);
            setSettingsDialogOpen(false);
            setSettingsApp(null);
        }
    };

    return (
        <>
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search apps..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg">In Use Apps</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Apps implemented directly in this project. Only developers with source code access can manage these.
                    </p>
                </CardHeader>
                <CardContent className="space-y-2">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : filteredApps.length > 0 ? (
                        filteredApps.map((app) => {
                            const categoryNames = getCategoryNamesForApp(app.id);
                            return (
                                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <AppIcon route={app.route} size="sm" />
                                        <div>
                                            <h4 className="font-medium text-foreground">{app.name}</h4>
                                            <p className="text-sm text-muted-foreground">{app.short_description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {categoryNames.length > 0 ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex gap-1 items-center max-w-[150px]">
                                                            <Badge variant="outline" className="text-xs truncate max-w-[80px]">{categoryNames[0]}</Badge>
                                                            {categoryNames.length > 1 && (
                                                                <Badge variant="outline" className="text-xs flex-shrink-0">+{categoryNames.length - 1}</Badge>
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[200px]">
                                                        <p className="text-xs">{categoryNames.join(", ")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">No category</Badge>
                                        )}
                                        <Badge className={cn("border-0", getStatusBadgeStyle(app.status))}>
                                            {getStatusLabel(app.status)}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2" onClick={() => navigate(app.route)}>
                                                    <ExternalLink className="w-4 h-4" /> Open
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2" onClick={() => handleOpenStatus(app)}>
                                                    <RefreshCw className="w-4 h-4" /> Change Status
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2" onClick={() => handleOpenSettings(app)}>
                                                    <Sliders className="w-4 h-4" /> Settings
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">No apps found.</div>
                    )}
                </CardContent>
            </Card>

            {/* Change Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Change Status</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Current App</Label>
                            <p className="text-sm text-muted-foreground">{selectedApp?.name}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={newStatus} onValueChange={(value: AppStatus) => setNewStatus(value)}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Available</div></SelectItem>
                                    <SelectItem value="disable"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Disabled</div></SelectItem>
                                    <SelectItem value="developing"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Developing</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleChangeStatus} className="w-full">Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>App Settings</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="appName">Name</Label>
                            <Input id="appName" placeholder="Enter app name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortDesc">Short Description</Label>
                            <Input id="shortDesc" placeholder="Brief description" value={editShortDesc} onChange={(e) => setEditShortDesc(e.target.value)} />
                        </div>
                        {/* Categories multi-select */}
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[44px]">
                                {editCategories.length === 0 && <span className="text-muted-foreground text-sm">No categories selected</span>}
                                {editCategories.map((catId) => {
                                    const cat = categories.find((c) => c.id === catId);
                                    if (!cat) return null;
                                    return (
                                        <Badge key={catId} variant="secondary" className="gap-1 pr-1">
                                            {cat.name}
                                            <button className="ml-1 hover:bg-muted rounded p-0.5" onClick={() => setEditCategories((prev) => prev.filter((id) => id !== catId))}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.filter((c) => !editCategories.includes(c.id)).map((cat) => (
                                    <Button key={cat.id} variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditCategories((prev) => [...prev, cat.id])}>
                                        <Plus className="w-3 h-3 mr-1" />{cat.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longDesc">Long Description</Label>
                            <Textarea id="longDesc" placeholder="Detailed description" value={editLongDesc} onChange={(e) => setEditLongDesc(e.target.value)} rows={4} />
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
