import { useState } from "react";
import { useSidebarSettings, basicNavItems } from "@/hooks/useSidebarSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AppIcon } from "@/components/icons/AppIcon";

// Available pages in OneApp (all apps)
const availablePages = [
  { title: "Dashboard", url: "/", iconName: "LayoutDashboard" },
  { title: "OneLibrary", url: "/library", iconName: "MonitorPlay" },
  { title: "OneApp AI", url: "/developing/ai", iconName: "Sparkles" },
  { title: "OneApp Data", url: "/developing/data", iconName: "Database" },
  { title: "OneApp Developer", url: "/workspace/developer", iconName: "Code" },
  { title: "System Admin", url: "/customization/admin", iconName: "Shield" },
  { title: "OneCrypto", url: "/apps/crypto", iconName: "Bitcoin" },
  { title: "OneNote", url: "/apps/onenote", iconName: "StickyNote" },
];

export default function SidebarSettings() {
  const {
    settings,
    toggleBasicItem,
    addSection,
    updateSection,
    deleteSection,
    addItemToSection,
    removeItemFromSection,
    resetToDefaults,
  } = useSidebarSettings();

  const [newSectionName, setNewSectionName] = useState("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [addItemSectionId, setAddItemSectionId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<typeof availablePages[0] | null>(null);

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addSection(newSectionName.trim());
      setNewSectionName("");
      setIsAddSectionOpen(false);
    }
  };

  const handleUpdateSection = () => {
    if (editingSectionId && editingSectionName.trim()) {
      updateSection(editingSectionId, editingSectionName.trim());
      setEditingSectionId(null);
      setEditingSectionName("");
    }
  };

  const handleAddItem = () => {
    if (addItemSectionId && selectedPage) {
      addItemToSection(addItemSectionId, {
        title: selectedPage.title,
        url: selectedPage.url,
        iconName: selectedPage.iconName,
      });
      setSelectedPage(null);
      setAddItemSectionId(null);
      toast.success(`Added "${selectedPage.title}" to section`);
    }
  };

  const enabledCount = settings.basicItems.length;

  const handleReset = () => {
    resetToDefaults();
    toast.success("Sidebar settings reset to defaults");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <BackNavigation to="/customization/interface" label="Back to Interface" />
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Basic Navigation Items */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Basic Navigation Items</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select which basic function pages should appear in the sidebar (maximum 3).
          </p>
          <div className="space-y-3">
            {basicNavItems.map((item) => {
              const isEnabled = settings.basicItems.includes(item.id);
              const isDisabled = !isEnabled && enabledCount >= 3;

              return (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    isEnabled ? "border-primary/50 bg-primary/5" : "border-border",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    checked={isEnabled}
                    onCheckedChange={() => !isDisabled && toggleBasicItem(item.id)}
                    disabled={isDisabled}
                  />
                  <AppIcon route={item.url} size="xs" showBackground={false} />
                  <span className="text-foreground">{item.title}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Sections */}
      <Card className="setting-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Custom Sections</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create custom sections to organize your navigation items. These appear between basic items and customization.
              </p>
            </div>
            <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Section name (e.g., My Projects)"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                  />
                  <Button onClick={handleAddSection} className="w-full">
                    Create Section
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {settings.customSections.map((section) => (
              <div key={section.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  {editingSectionId === section.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingSectionName}
                        onChange={(e) => setEditingSectionName(e.target.value)}
                        className="h-8"
                      />
                      <Button size="sm" onClick={handleUpdateSection}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSectionId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium text-foreground">{section.label}</h4>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingSectionId(section.id);
                            setEditingSectionName(section.label);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteSection(section.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  {section.items.map((item) => {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <AppIcon route={item.url} size="xs" showBackground={false} />
                        <span className="flex-1 text-sm">{item.title}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => removeItemFromSection(section.id, item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Item Dialog */}
                <Dialog
                  open={addItemSectionId === section.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      setAddItemSectionId(null);
                      setSelectedPage(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-2 transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => setAddItemSectionId(section.id)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Page
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Page to Section</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-4 max-h-[400px] overflow-y-auto">
                      {availablePages.map((page) => {
                        const isSelected = selectedPage?.url === page.url;
                        
                        return (
                          <button
                            key={page.url}
                            onClick={() => setSelectedPage(page)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200",
                              isSelected 
                                ? "border-primary bg-primary/10 ring-1 ring-primary" 
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <AppIcon route={page.url} size="sm" />
                            <div className="flex-1">
                              <p className={cn(
                                "font-medium text-sm",
                                isSelected ? "text-primary" : "text-foreground"
                              )}>{page.title}</p>
                              <p className="text-xs text-muted-foreground">{page.url}</p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={handleAddItem} 
                      className="w-full mt-4"
                      disabled={!selectedPage}
                    >
                      Add to Section
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
