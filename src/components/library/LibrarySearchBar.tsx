import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/hooks/useInUseApps";

interface FilterChip {
  key: string;
  label: string;
}

const statusFilters: FilterChip[] = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "developing", label: "Coming Soon" },
  { key: "disable", label: "Disabled" },
];

interface LibrarySearchBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  resultCount?: number;
}

export function LibrarySearchBar({ search, onSearchChange, statusFilter, onStatusFilterChange, resultCount }: LibrarySearchBarProps) {
  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-10 text-sm bg-muted/30 border-border/50 focus:border-primary/40"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips + Result Count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => onStatusFilterChange(f.key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                statusFilter === f.key
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {resultCount !== undefined && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {resultCount} {resultCount === 1 ? "app" : "apps"}
          </span>
        )}
      </div>
    </div>
  );
}
