import { useState } from "react";
import { Menu, Sun, Moon, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { docsCategories, DocPage, getFirstPage } from "@/data/docsContent";
import { DocsSidebar } from "./DocsSidebar";
import { DocsContent } from "./DocsContent";
import { DocsSearchBar } from "./DocsSearchBar";
import { DocsTOC } from "./DocsTOC";
import oneappLogo from "@/assets/oneapp-logo.png";

interface DocsLayoutProps {
  activeCategoryId: string;
  activePageSlug: string;
  activePage: DocPage;
  onNavigate: (categoryId: string, pageSlug: string) => void;
}

function usePrevNext(categoryId: string, pageSlug: string) {
  const allPages: { categoryId: string; page: DocPage }[] = [];
  docsCategories.forEach((cat) => {
    cat.pages.forEach((page) => {
      allPages.push({ categoryId: cat.id, page });
    });
  });

  const idx = allPages.findIndex(
    (p) => p.categoryId === categoryId && p.page.slug === pageSlug
  );

  return {
    prev: idx > 0 ? allPages[idx - 1] : null,
    next: idx < allPages.length - 1 ? allPages[idx + 1] : null,
  };
}

export function DocsLayout({ activeCategoryId, activePageSlug, activePage, onNavigate }: DocsLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { prev, next } = usePrevNext(activeCategoryId, activePageSlug);

  const activeCategory = docsCategories.find((c) => c.id === activeCategoryId);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-4 px-4 md:px-6 h-14">
          {/* Logo */}
          <Link to="/explore" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <img src={oneappLogo} alt="OneApp" className="w-6 h-6" />
            <span className="font-bold text-sm hidden sm:block">OneApp</span>
            <span className="text-muted-foreground text-sm hidden sm:block">/</span>
            <span className="text-sm font-semibold text-primary hidden sm:block">Docs</span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-5 w-px bg-border" />

          {/* Search */}
          <div className="flex-1 max-w-sm">
            <DocsSearchBar onNavigate={onNavigate} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 shrink-0"
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Back to app */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/explore")}
              className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Back to site
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden w-9 h-9">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                  <img src={oneappLogo} alt="OneApp" className="w-5 h-5" />
                  <span className="font-semibold text-sm">Documentation</span>
                </div>
                <ScrollArea className="h-[calc(100vh-60px)]">
                  <DocsSidebar
                    activeCategoryId={activeCategoryId}
                    activePageSlug={activePageSlug}
                    onNavigate={onNavigate}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex max-w-[1400px] mx-auto">
        {/* Left sidebar — desktop only */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-hidden border-r border-border/50">
          <ScrollArea className="h-full">
            <DocsSidebar
              activeCategoryId={activeCategoryId}
              activePageSlug={activePageSlug}
              onNavigate={onNavigate}
            />
          </ScrollArea>
        </aside>

        {/* Content area */}
        <main className="flex-1 min-w-0">
          <div className="flex">
            {/* Article */}
            <article className="flex-1 min-w-0 px-6 md:px-10 py-10 max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
                <span>Docs</span>
                <span>/</span>
                <span>{activeCategory?.title}</span>
                <span>/</span>
                <span className="text-foreground">{activePage.title}</span>
              </nav>

              {/* Content */}
              <DocsContent content={activePage.content} title={activePage.title} />

              {/* Prev/Next navigation */}
              <div className="mt-12 pt-8 border-t border-border flex items-center justify-between gap-4">
                {prev ? (
                  <button
                    onClick={() => onNavigate(prev.categoryId, prev.page.slug)}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-xl border border-border",
                      "hover:border-primary/50 hover:bg-muted/30 transition-all text-left",
                      "max-w-[45%]"
                    )}
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Previous</div>
                      <div className="text-sm font-medium text-foreground truncate">{prev.page.title}</div>
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {next ? (
                  <button
                    onClick={() => onNavigate(next.categoryId, next.page.slug)}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-xl border border-border",
                      "hover:border-primary/50 hover:bg-muted/30 transition-all text-right",
                      "max-w-[45%] ml-auto"
                    )}
                  >
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Next</div>
                      <div className="text-sm font-medium text-foreground truncate">{next.page.title}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ) : (
                  <div />
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 text-xs text-muted-foreground text-center pb-8">
                OneApp Documentation · v2.6.8
              </div>
            </article>

            {/* Right TOC — desktop only */}
            <aside className="hidden xl:block w-56 shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-hidden py-10 px-4">
              <DocsTOC content={activePage.content} />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
