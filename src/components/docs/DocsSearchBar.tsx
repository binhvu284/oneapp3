import { useState, useRef, useEffect } from "react";
import { Search, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { allDocPages } from "@/data/docsContent";

interface SearchResult {
  id: string;
  title: string;
  categoryTitle: string;
  categoryId: string;
  slug: string;
  excerpt: string;
}

interface DocsSearchBarProps {
  onNavigate: (categoryId: string, pageSlug: string) => void;
}

function getExcerpt(content: string, query: string): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.replace(/[#*`]/g, "").slice(0, 80) + "…";
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + 80);
  return (start > 0 ? "…" : "") + content.slice(start, end).replace(/[#*`]/g, "") + (end < content.length ? "…" : "");
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-primary rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function DocsSearchBar({ onNavigate }: DocsSearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const found = allDocPages
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.categoryTitle.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        title: p.title,
        categoryTitle: p.categoryTitle,
        categoryId: p.categoryId,
        slug: p.slug,
        excerpt: getExcerpt(p.content, query),
      }));
    setResults(found);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.categoryId, result.slug);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search docs…"
          className={cn(
            "w-full pl-9 pr-9 py-2 text-sm rounded-lg",
            "bg-muted/50 border border-border/50",
            "focus:outline-none focus:border-primary/50 focus:bg-background",
            "placeholder:text-muted-foreground",
            "transition-colors"
          )}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 flex items-start gap-3"
            >
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {highlight(r.title, query)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.categoryTitle}</div>
                <div className="text-xs text-muted-foreground/70 mt-1 truncate">
                  {r.excerpt}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-4 text-center text-sm text-muted-foreground">
          No results for "{query}"
        </div>
      )}
    </div>
  );
}
