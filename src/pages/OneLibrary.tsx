import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Clock, Layers, Grid3X3, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInUseApps, type InUseApp } from "@/hooks/useInUseApps";
import { useCategories } from "@/hooks/useCategories";
import { useAppCategories } from "@/hooks/useAppCategories";

import { AppCardLarge, AppCardLargeSkeleton } from "@/components/library/AppCardLarge";
import { AppListItem, AppListItemSkeleton } from "@/components/library/AppListItem";
import { FeaturedAppCard, FeaturedAppCardSkeleton } from "@/components/library/FeaturedAppCard";
import { QuickAccessRow, QuickAccessRowSkeleton } from "@/components/library/QuickAccessRow";
import { ExploreSection } from "@/components/library/ExploreSection";
import { AppDetailModal } from "@/components/library/AppDetailModal";
import { LibrarySearchBar } from "@/components/library/LibrarySearchBar";
import { CategoryRow, CategoryRowSkeleton } from "@/components/library/CategoryRow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}

export default function OneLibrary() {
  const navigate = useNavigate();
  const { apps, isLoading } = useInUseApps();
  const { categories, loading: categoriesLoading } = useCategories();
  const { getAppIdsForCategory, getCategoryIdsForApp } = useAppCategories();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailApp, setDetailApp] = useState<InUseApp | null>(null);

  const available = useMemo(() => apps.filter(a => a.status === "available"), [apps]);
  const developing = useMemo(() => apps.filter(a => a.status === "developing"), [apps]);

  // All Apps tab filtering
  const filtered = useMemo(() => {
    let result = apps;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q) || a.short_description?.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter(a => a.status === statusFilter);
    }
    return result;
  }, [apps, search, statusFilter]);

  const handleOpen = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const getCategoryNamesForApp = useCallback((app: InUseApp) => {
    const catIds = getCategoryIdsForApp(app.id);
    return categories.filter(c => catIds.includes(c.id)).map(c => c.name);
  }, [categories, getCategoryIdsForApp]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="explore" className="space-y-4">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="explore" className="text-xs gap-1.5 h-7"><Rocket className="w-3.5 h-3.5" />Explore</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-1.5 h-7"><Layers className="w-3.5 h-3.5" />Categories</TabsTrigger>
          <TabsTrigger value="all" className="text-xs gap-1.5 h-7"><Grid3X3 className="w-3.5 h-3.5" />All Apps</TabsTrigger>
          <TabsTrigger value="coming" className="text-xs gap-1.5 h-7"><Clock className="w-3.5 h-3.5" />Coming Soon</TabsTrigger>
        </TabsList>

        {/* Explore Tab - Large Cards */}
        <TabsContent value="explore" className="space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              <FeaturedAppCardSkeleton />
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <QuickAccessRowSkeleton />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }, (_, i) => <AppCardLargeSkeleton key={i} />)}
                </div>
              </div>
            </div>
          ) : available.length > 0 ? (
            <div className="space-y-6">
              {/* Featured App - Hero */}
              <div className="animate-fade-in" style={{ animationDelay: "0ms", animationFillMode: "backwards" }}>
                <FeaturedAppCard
                  app={available[0]}
                  onOpen={() => handleOpen(available[0].route)}
                  onDetail={() => setDetailApp(available[0])}
                />
              </div>

              {/* Quick Access */}
              {available.length > 1 && (
                <ExploreSection title="Quick Access" description="Jump to your apps" delay={100}>
                  <QuickAccessRow
                    apps={available.slice(1)}
                    onOpen={handleOpen}
                  />
                </ExploreSection>
              )}

              {/* All Available Grid */}
              {available.length > 1 && (
                <ExploreSection title="All Available" description="Browse all your apps" delay={200}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {available.slice(1).map((app) => (
                      <AppCardLarge
                        key={app.id}
                        app={app}
                        onOpen={() => handleOpen(app.route)}
                        onDetail={() => setDetailApp(app)}
                      />
                    ))}
                  </div>
                </ExploreSection>
              )}

              {/* Developing Teaser */}
              {developing.length > 0 && (
                <ExploreSection title="Coming Soon" description="Apps in development" delay={300}>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {developing.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setDetailApp(app)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.06] border border-amber-500/15 hover:border-amber-500/30 transition-all min-w-fit"
                      >
                        <Rocket className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground whitespace-nowrap">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </ExploreSection>
              )}
            </div>
          ) : (
            <EmptyState icon={Rocket} title="No apps yet" description="Available apps will appear here." />
          )}
        </TabsContent>

        {/* Categories Tab - Horizontal Scroll Rows */}
        <TabsContent value="categories" className="animate-fade-in">
          {categoriesLoading || isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, i) => <CategoryRowSkeleton key={i} />)}
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-5">
              {categories.map((cat) => {
                const appIds = getAppIdsForCategory(cat.id);
                const catApps = apps.filter(a => appIds.includes(a.id));
                return (
                  <CategoryRow
                    key={cat.id}
                    name={cat.name}
                    color={cat.color}
                    apps={catApps}
                    onAppClick={(app) => app.status === "available" ? handleOpen(app.route) : setDetailApp(app)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Layers} title="No categories" description="Create categories to organize your apps." />
          )}
        </TabsContent>

        {/* All Apps Tab - List View */}
        <TabsContent value="all" className="space-y-3 animate-fade-in">
          <LibrarySearchBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            resultCount={filtered.length}
          />
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 6 }, (_, i) => <AppListItemSkeleton key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-0.5 rounded-xl border border-border/40 bg-card/30 p-1">
              {filtered.map((app) => (
                <AppListItem
                  key={app.id}
                  app={app}
                  onOpen={() => handleOpen(app.route)}
                  onDetail={() => setDetailApp(app)}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={Search} title="No results" description="Try a different search or filter." />
          )}
        </TabsContent>

        {/* Coming Soon Tab */}
        <TabsContent value="coming" className="animate-fade-in">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, i) => <AppCardLargeSkeleton key={i} />)}
            </div>
          ) : developing.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {developing.map((app) => (
                <Card
                  key={app.id}
                  onClick={() => setDetailApp(app)}
                  className="p-5 border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm cursor-pointer hover:border-amber-500/30 hover:bg-amber-500/[0.06] transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-foreground text-sm">{app.name}</h3>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 bg-amber-500/15 text-amber-500 border-amber-500/25 font-medium">
                          In Development
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{app.short_description || "Coming soon..."}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={Clock} title="Nothing in the pipeline" description="New apps being developed will appear here." />
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <AppDetailModal
        app={detailApp}
        open={!!detailApp}
        onOpenChange={(open) => !open && setDetailApp(null)}
        onOpen={(route) => { setDetailApp(null); navigate(route); }}
        categoryNames={detailApp ? getCategoryNamesForApp(detailApp) : []}
      />
    </div>
  );
}
