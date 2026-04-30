import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { docsCategories, DocCategory, DocPage } from "@/data/docsContent";

interface DocsSidebarProps {
  activeCategoryId: string;
  activePageSlug: string;
  onNavigate: (categoryId: string, pageSlug: string) => void;
  onClose?: () => void;
}

function CategoryItem({
  category,
  activeCategoryId,
  activePageSlug,
  onNavigate,
  onClose,
}: {
  category: DocCategory;
  activeCategoryId: string;
  activePageSlug: string;
  onNavigate: (categoryId: string, pageSlug: string) => void;
  onClose?: () => void;
}) {
  const isActive = category.id === activeCategoryId;
  const [open, setOpen] = useState(isActive);
  const Icon = category.icon;

  const handlePageClick = (page: DocPage) => {
    onNavigate(category.id, page.slug);
    onClose?.();
  };

  return (
    <div className="mb-1">
      {/* Category header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          "transition-colors hover:bg-muted",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{category.title}</span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Pages */}
      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border/50 pl-3">
          {category.pages.map((page) => {
            const isPageActive =
              category.id === activeCategoryId && page.slug === activePageSlug;
            return (
              <button
                key={page.id}
                onClick={() => handlePageClick(page)}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                  isPageActive
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {page.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DocsSidebar({
  activeCategoryId,
  activePageSlug,
  onNavigate,
  onClose,
}: DocsSidebarProps) {
  return (
    <nav className="py-4 px-2">
      {docsCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          activeCategoryId={activeCategoryId}
          activePageSlug={activePageSlug}
          onNavigate={onNavigate}
          onClose={onClose}
        />
      ))}
    </nav>
  );
}
