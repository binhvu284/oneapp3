import { useState, useEffect, useRef, useCallback } from "react";
import { X, FileText, CheckSquare, Loader2 } from "lucide-react";
import { Note } from "@/hooks/useNotes";
import { NoteItem, useNoteItems } from "@/hooks/useNoteItems";
import { NoteTag } from "@/hooks/useNoteTags";
import { NoteColorPicker } from "./NoteColorPicker";
import { TagManager } from "./TagManager";
import { TagBadge } from "./TagBadge";
import { TodoItems } from "./TodoItems";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface NoteEditorPanelProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => Promise<boolean>;
  allTags: NoteTag[];
  noteTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => Promise<NoteTag | null>;
}

export function NoteEditorPanel({ note, open, onClose, onUpdate, allTags, noteTagIds, onToggleTag, onCreateTag }: NoteEditorPanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<string>("note");
  const [color, setColor] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, isLoading: itemsLoading, fetchItems, addItem, updateItem, deleteItem, reorderItems } = useNoteItems(note?.id || null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setNoteType(note.note_type);
      setColor(note.color);
      fetchItems();
    }
  }, [note?.id]);

  const debouncedSave = useCallback((updates: Partial<Note>) => {
    if (!note) return;
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await onUpdate(note.id, updates);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 1000);
  }, [note, onUpdate]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    debouncedSave({ title: val });
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    debouncedSave({ content: val });
  };

  const handleTypeToggle = () => {
    const newType = noteType === "note" ? "todo" : "note";
    setNoteType(newType);
    if (note) onUpdate(note.id, { note_type: newType });
  };

  const handleColorChange = (c: string | null) => {
    setColor(c);
    if (note) onUpdate(note.id, { color: c });
  };

  const selectedTags = allTags.filter(t => noteTagIds.includes(t.id));

  if (!note) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:w-[440px] p-0 flex flex-col" side="right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <button onClick={handleTypeToggle} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted">
              {noteType === "todo" ? <CheckSquare className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              {noteType === "todo" ? "Todo" : "Note"}
            </button>
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-[10px] text-success">Saved</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full text-lg font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40"
            autoFocus
          />

          {/* Content area */}
          {noteType === "todo" ? (
            <TodoItems
              items={items}
              onAdd={addItem}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onReorder={reorderItems}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing..."
              className="w-full min-h-[200px] text-sm bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/40"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border space-y-3">
          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedTags.map(tag => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} size="md" onRemove={() => onToggleTag(tag.id)} />
            ))}
            <TagManager
              allTags={allTags}
              selectedTagIds={noteTagIds}
              onToggleTag={onToggleTag}
              onCreateTag={onCreateTag}
            />
          </div>

          {/* Color picker */}
          <NoteColorPicker value={color} onChange={handleColorChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
