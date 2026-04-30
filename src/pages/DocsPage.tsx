import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { docsCategories, getFirstPage } from "@/data/docsContent";

export default function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategoryId = searchParams.get("cat") || getFirstPage().categoryId;
  const initialSlug = searchParams.get("page") || getFirstPage().slug;

  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [activePageSlug, setActivePageSlug] = useState(initialSlug);

  const activePage = (() => {
    const cat = docsCategories.find((c) => c.id === activeCategoryId);
    return cat?.pages.find((p) => p.slug === activePageSlug) ?? getFirstPage();
  })();

  const handleNavigate = (categoryId: string, pageSlug: string) => {
    setActiveCategoryId(categoryId);
    setActivePageSlug(pageSlug);
    setSearchParams({ cat: categoryId, page: pageSlug });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sync URL params on back/forward navigation
  useEffect(() => {
    const cat = searchParams.get("cat");
    const page = searchParams.get("page");
    if (cat && page) {
      setActiveCategoryId(cat);
      setActivePageSlug(page);
    }
  }, [searchParams]);

  return (
    <DocsLayout
      activeCategoryId={activeCategoryId}
      activePageSlug={activePageSlug}
      activePage={activePage}
      onNavigate={handleNavigate}
    />
  );
}
