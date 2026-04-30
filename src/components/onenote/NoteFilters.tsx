import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoteFilter, NoteSort } from "@/hooks/useNotes";
import { NoteTag } from "@/hooks/useNoteTags";

interface NoteFiltersProps {
  filter: NoteFilter;
  onFilterChange: (f: NoteFilter) => void;
  sort: NoteSort;
  onSortChange: (s: NoteSort) => void;
  tags: NoteTag[];
  tagFilter: string | null;
  onTagFilterChange: (tagId: string | null) => void;
}

export function NoteFilters({ filter, onFilterChange, sort, onSortChange, tags, tagFilter, onTagFilterChange }: NoteFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as NoteFilter)}>
        <TabsList className="h-8 bg-muted/50">
          <TabsTrigger value="all" className="text-xs h-6 px-3">All</TabsTrigger>
          <TabsTrigger value="pinned" className="text-xs h-6 px-3">Pinned</TabsTrigger>
          <TabsTrigger value="archived" className="text-xs h-6 px-3">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {tags.length > 0 && (
        <Select value={tagFilter || "all"} onValueChange={(v) => onTagFilterChange(v === "all" ? null : v)}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All tags</SelectItem>
            {tags.map(tag => (
              <SelectItem key={tag.id} value={tag.id} className="text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sort} onValueChange={(v) => onSortChange(v as NoteSort)}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest" className="text-xs">Newest</SelectItem>
          <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
          <SelectItem value="az" className="text-xs">Name A-Z</SelectItem>
          <SelectItem value="za" className="text-xs">Name Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
