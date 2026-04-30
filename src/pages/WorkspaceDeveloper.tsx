import { useState } from "react";
import { Zap, Menu, CheckSquare, Link2, GitBranch, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { useInUseApps } from "@/hooks/useInUseApps";
import { useAppCategories } from "@/hooks/useAppCategories";
import { CategoryTab } from "@/components/developer/CategoryTab";
import { InUseAppsTab } from "@/components/developer/InUseAppsTab";
import { IntegratedAppsTab, OpenSourceTab } from "@/components/developer/IntegratedAppsTab";

/**
 * WorkspaceDeveloper — refactored shell.
 *
 * Each tab's UI and local state now lives in its own component:
 *   - CategoryTab   → src/components/developer/CategoryTab.tsx
 *   - InUseAppsTab  → src/components/developer/InUseAppsTab.tsx
 *   - IntegratedAppsTab / OpenSourceTab → src/components/developer/IntegratedAppsTab.tsx
 */
export default function WorkspaceDeveloper() {
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    categories, loading: categoriesLoading,
    addCategory, updateCategory, deleteCategory, uploadCategoryIcon
  } = useCategories();

  const { apps, isLoading: appsLoading, updateApp, updateStatus } = useInUseApps();

  const {
    getCategoryIdsForApp,
    getAppIdsForCategory,
    getAppsCountForCategory,
    setAppCategories,
    addAppToCategory,
    removeAppFromCategory,
  } = useAppCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">OneApp Developer</h1>
          <p className="text-muted-foreground mt-1">Manage categories and applications in the library</p>
        </div>
        {(activeTab === "inuse" || activeTab === "integrated") && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New App
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-6">
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2"
          >
            <Menu className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="inuse"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            In Use Apps
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{apps.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="integrated"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2"
          >
            <Link2 className="w-4 h-4" />
            Integrated
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">1</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="opensource"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Open Source
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">0</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <CategoryTab
            categories={categories}
            loading={categoriesLoading}
            apps={apps}
            getAppIdsForCategory={getAppIdsForCategory}
            getAppsCountForCategory={getAppsCountForCategory}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
            addAppToCategory={addAppToCategory}
            removeAppFromCategory={removeAppFromCategory}
            uploadCategoryIcon={uploadCategoryIcon}
          />
        </TabsContent>

        <TabsContent value="inuse" className="mt-6 space-y-4">
          <InUseAppsTab
            apps={apps}
            isLoading={appsLoading}
            categories={categories}
            getCategoryIdsForApp={getCategoryIdsForApp}
            setAppCategoriesForApp={setAppCategories}
            updateApp={updateApp}
            updateStatus={updateStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </TabsContent>

        <TabsContent value="integrated" className="mt-6 space-y-4">
          <IntegratedAppsTab
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </TabsContent>

        <TabsContent value="opensource" className="mt-6">
          <OpenSourceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
