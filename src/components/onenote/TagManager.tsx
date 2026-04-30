import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagBadge } from "./TagBadge";
import { NoteTag } from "@/hooks/useNoteTags";

const TAG_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

interface TagManagerProps {
  allTags: NoteTag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => Promise<NoteTag | null>;
}

export function TagManager({ allTags, selectedTagIds, onToggleTag, onCreateTag }: TagManagerProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    const tag = await onCreateTag(newName.trim(), newColor);
    if (tag) onToggleTag(tag.id);
    setNewName("");
    setIsCreating(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
          <Plus className="w-3 h-3" /> Tags
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* Existing tags */}
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => onToggleTag(tag.id)}
                className={`transition-opacity ${selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
              >
                <TagBadge name={tag.name} color={tag.color} size="md" />
              </button>
            ))}
            {allTags.length === 0 && (
              <p className="text-xs text-muted-foreground">No tags yet</p>
            )}
          </div>

          {/* Create new tag */}
          <div className="border-t border-border pt-2 space-y-2">
            <div className="flex gap-1.5">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="New tag..."
                className="h-7 text-xs"
              />
              <Button size="sm" className="h-7 px-2" onClick={handleCreate} disabled={isCreating || !newName.trim()}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex gap-1">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
