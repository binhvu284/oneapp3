import { useState } from "react";
import React from "react";
import {
    Trash2, Edit, Plus, Upload, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker, renderIconByName } from "@/components/icons/IconPicker";
import { AppIcon } from "@/components/icons/AppIcon";
import { ColorPicker } from "@/components/theme/ColorPicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { type Category } from "@/hooks/useCategories";
import { type InUseApp } from "@/hooks/useInUseApps";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CategoryTabProps {
    categories: Category[];
    loading: boolean;
    apps: InUseApp[];
    getAppIdsForCategory: (categoryId: string) => string[];
    getAppsCountForCategory: (categoryId: string) => number;
    addCategory: (name: string, description: string, iconName: string, color: string) => Promise<Category | null>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<Category | null>;
    deleteCategory: (id: string) => Promise<boolean>;
    addAppToCategory: (appId: string, categoryId: string) => Promise<any>;
    removeAppFromCategory: (appId: string, categoryId: string) => Promise<boolean>;
    uploadCategoryIcon: (file: File) => Promise<string | null>;
}

// ─── CategoryTab ─────────────────────────────────────────────────────────────

export function CategoryTab({
    categories,
    loading,
    apps,
    getAppIdsForCategory,
    getAppsCountForCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addAppToCategory,
    removeAppFromCategory,
    uploadCategoryIcon,
}: CategoryTabProps) {
    // Add category state
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [newCategoryIcon, setNewCategoryIcon] = useState("Folder");
    const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
    const [iconPickerOpen, setIconPickerOpen] = useState(false);

    // View category apps dialog
    const [categoryAppsDialogOpen, setCategoryAppsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Edit category dialog
    const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editCategoryDescription, setEditCategoryDescription] = useState("");
    const [editCategoryIcon, setEditCategoryIcon] = useState("Folder");
    const [editCategoryColor, setEditCategoryColor] = useState("#3b82f6");
    const [editCategoryIconPickerOpen, setEditCategoryIconPickerOpen] = useState(false);

    // Manage apps in category dialog
    const [manageAppsDialogOpen, setManageAppsDialogOpen] = useState(false);
    const [managingCategory, setManagingCategory] = useState<Category | null>(null);
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
    const [savingManageApps, setSavingManageApps] = useState(false);

    // Upload
    const [uploadingIcon, setUploadingIcon] = useState(false);

    // ─── Helpers ────────────────────────────────────────────────────────────────

    const getAppsByCategory = (categoryId: string) => {
        const appIds = getAppIdsForCategory(categoryId);
        return apps.filter((app) => appIds.includes(app.id));
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }
        const result = await addCategory(newCategoryName, newCategoryDescription, newCategoryIcon, newCategoryColor);
        if (result) {
            toast.success("Category added successfully");
            setNewCategoryName("");
            setNewCategoryDescription("");
            setNewCategoryIcon("Folder");
            setNewCategoryColor("#3b82f6");
            setAddCategoryOpen(false);
        } else {
            toast.error("Failed to add category");
        }
    };

    const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await deleteCategory(id);
        toast[success ? "success" : "error"](success ? "Category deleted" : "Failed to delete category");
    };

    const handleOpenEditCategory = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCategory(category);
        setEditCategoryName(category.name);
        setEditCategoryDescription(category.description || "");
        setEditCategoryIcon(category.icon_name || "Folder");
        setEditCategoryColor(category.color || "#3b82f6");
        setEditCategoryDialogOpen(true);
    };

    const handleSaveEditCategory = async () => {
        if (!editingCategory) return;
        const result = await updateCategory(editingCategory.id, {
            name: editCategoryName,
            description: editCategoryDescription || null,
            icon_name: editCategoryIcon,
            color: editCategoryColor,
        });
        if (result) {
            toast.success("Category updated");
            setEditCategoryDialogOpen(false);
            setEditingCategory(null);
        } else {
            toast.error("Failed to update category");
        }
    };

    const handleOpenManageApps = (category: Category) => {
        setManagingCategory(category);
        setSelectedAppIds(getAppIdsForCategory(category.id));
        setManageAppsDialogOpen(true);
    };

    const handleSaveManageApps = async () => {
        if (!managingCategory) return;
        setSavingManageApps(true);
        try {
            const currentAppIds = getAppIdsForCategory(managingCategory.id);
            const toAdd = selectedAppIds.filter((id) => !currentAppIds.includes(id));
            const toRemove = currentAppIds.filter((id) => !selectedAppIds.includes(id));
            for (const appId of toAdd) await addAppToCategory(appId, managingCategory.id);
            for (const appId of toRemove) await removeAppFromCategory(appId, managingCategory.id);
            toast.success("Apps updated");
            setManageAppsDialogOpen(false);
            setManagingCategory(null);
        } finally {
            setSavingManageApps(false);
        }
    };

    const handleUploadCategoryIcon = async (file: File) => {
        setUploadingIcon(true);
        try {
            const publicUrl = await uploadCategoryIcon(file);
            if (!publicUrl) throw new Error("Upload failed");

            if (editingCategory) {
                await updateCategory(editingCategory.id, { icon_url: publicUrl });
                toast.success("Icon uploaded");
            }
        } catch {
            toast.error("Failed to upload icon");
        } finally {
            setUploadingIcon(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg">Manage Categories</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Create and manage categories to organize applications. Apps can belong to multiple categories.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : (
                        <>
                            {/* Category list */}
                            {categories.length > 0 && (
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => { setSelectedCategory(category); setCategoryAppsDialogOpen(true); }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${category.color}20` }}
                                                >
                                                    {category.icon_url ? (
                                                        <img src={category.icon_url} alt={category.name} className="w-5 h-5 rounded object-cover" />
                                                    ) : (
                                                        renderIconByName(category.icon_name || "Folder", "w-5 h-5", { color: category.color || "#3b82f6" })
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-foreground">{category.name}</h4>
                                                    {category.description && (
                                                        <p className="text-sm text-muted-foreground">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="h-6 px-2">
                                                    {getAppsCountForCategory(category.id)} apps
                                                </Badge>
                                                <Button
                                                    variant="outline" size="sm" className="h-8"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenManageApps(category); }}
                                                >
                                                    Manage Apps
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8"
                                                    onClick={(e) => handleOpenEditCategory(category, e)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={(e) => handleDeleteCategory(category.id, e)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Category Button */}
                            <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
                                <DialogTrigger asChild>
                                    <button className="w-full border-2 border-dashed border-border rounded-lg p-6 flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                        <Plus className="w-5 h-5" /> Add Category
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label>Icon</Label>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary"
                                                    style={{ backgroundColor: `${newCategoryColor}20` }}
                                                    onClick={() => setIconPickerOpen(true)}
                                                >
                                                    {renderIconByName(newCategoryIcon, "w-7 h-7", { color: newCategoryColor })}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setIconPickerOpen(true)}>Choose Icon</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryName">Name</Label>
                                            <Input id="categoryName" placeholder="Enter category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryDesc">Description (optional)</Label>
                                            <Textarea id="categoryDesc" placeholder="Enter category description" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} />
                                        </div>
                                        <ColorPicker label="Color" value={newCategoryColor} onChange={setNewCategoryColor} />
                                        <Button onClick={handleAddCategory} className="w-full">Add Category</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <IconPicker open={iconPickerOpen} onOpenChange={setIconPickerOpen} selectedIcon={newCategoryIcon} onSelectIcon={setNewCategoryIcon} color={newCategoryColor} />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* View Category Apps Dialog */}
            <Dialog open={categoryAppsDialogOpen} onOpenChange={setCategoryAppsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${selectedCategory?.color}20` }}>
                                {selectedCategory?.icon_url
                                    ? <img src={selectedCategory.icon_url} alt={selectedCategory.name} className="w-4 h-4 rounded object-cover" />
                                    : renderIconByName(selectedCategory?.icon_name || "Folder", "w-4 h-4", { color: selectedCategory?.color || "#3b82f6" })}
                            </div>
                            {selectedCategory?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 pt-4 max-h-[60vh] overflow-y-auto">
                        {selectedCategory && getAppsByCategory(selectedCategory.id).length > 0 ? (
                            getAppsByCategory(selectedCategory.id).map((app) => (
                                <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                                    <AppIcon route={app.route} size="sm" />
                                    <div>
                                        <h4 className="font-medium text-foreground">{app.name}</h4>
                                        <p className="text-sm text-muted-foreground">{app.short_description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">No apps in this category.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary"
                                    style={{ backgroundColor: `${editCategoryColor}20` }}
                                    onClick={() => setEditCategoryIconPickerOpen(true)}
                                >
                                    {editingCategory?.icon_url
                                        ? <img src={editingCategory.icon_url} alt={editingCategory.name} className="w-8 h-8 rounded object-cover" />
                                        : renderIconByName(editCategoryIcon, "w-7 h-7", { color: editCategoryColor })}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setEditCategoryIconPickerOpen(true)}>Choose Icon</Button>
                                    <Button variant="outline" size="sm" disabled={uploadingIcon} asChild>
                                        <label>
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploadingIcon ? "Uploading..." : "Upload"}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadCategoryIcon(f); }} />
                                        </label>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCategoryName">Name</Label>
                            <Input id="editCategoryName" placeholder="Enter category name" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCategoryDesc">Description (optional)</Label>
                            <Textarea id="editCategoryDesc" placeholder="Enter category description" value={editCategoryDescription} onChange={(e) => setEditCategoryDescription(e.target.value)} />
                        </div>
                        <ColorPicker label="Color" value={editCategoryColor} onChange={setEditCategoryColor} />
                        <Button onClick={handleSaveEditCategory} className="w-full">Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <IconPicker
                open={editCategoryIconPickerOpen}
                onOpenChange={setEditCategoryIconPickerOpen}
                selectedIcon={editCategoryIcon}
                onSelectIcon={(icon) => {
                    setEditCategoryIcon(icon);
                    if (editingCategory) updateCategory(editingCategory.id, { icon_name: icon, icon_url: null });
                }}
                color={editCategoryColor}
            />

            {/* Manage Apps in Category Dialog */}
            <Dialog open={manageAppsDialogOpen} onOpenChange={setManageAppsDialogOpen}>
                <DialogContent className="max-w-lg flex flex-col max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Manage Apps in &quot;{managingCategory?.name}&quot;</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Select apps to add to this category. An app can belong to multiple categories.</p>
                    <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                        {apps.map((app) => {
                            const isSelected = selectedAppIds.includes(app.id);
                            return (
                                <div
                                    key={app.id}
                                    className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer", isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50")}
                                    onClick={() => setSelectedAppIds((prev) => isSelected ? prev.filter((id) => id !== app.id) : [...prev, app.id])}
                                >
                                    <Checkbox checked={isSelected} />
                                    <AppIcon route={app.route} size="sm" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-foreground">{app.name}</h4>
                                        <p className="text-sm text-muted-foreground">{app.short_description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="pt-4 border-t border-border mt-2">
                        <Button onClick={handleSaveManageApps} className="w-full" disabled={savingManageApps}>
                            {savingManageApps
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                : `Save (${selectedAppIds.length} apps selected)`}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
