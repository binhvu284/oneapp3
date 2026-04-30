import { useState, useEffect, useRef, useCallback } from "react";
import { X, FileText, CheckSquare, Loader2 } from "lucide-react";
import { Note } from "@/hooks/useNotes";
import { NoteItem, useNoteItems } from "@/hooks/useNoteItems";
import { NoteTag } from "@/hooks/useNoteTags";
import { NoteColorPicker } from "./NoteColorPicker";
import { TagManager } from "./TagManager";
import { TagBadge } from "./TagBadge";
import { TodoItems } from "./TodoItems";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NoteEditorInlineProps {
  note: Note;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => Promise<boolean>;
  allTags: NoteTag[];
  noteTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => Promise<NoteTag | null>;
}

export function NoteEditorInline({ note, onClose, onUpdate, allTags, noteTagIds, onToggleTag, onCreateTag }: NoteEditorInlineProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [noteType, setNoteType] = useState(note.note_type);
  const [color, setColor] = useState(note.color);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, isLoading: itemsLoading, fetchItems, addItem, updateItem, deleteItem, reorderItems } = useNoteItems(note.id);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setNoteType(note.note_type);
    setColor(note.color);
    fetchItems();
  }, [note.id]);

  const debouncedSave = useCallback((updates: Partial<Note>) => {
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await onUpdate(note.id, updates);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 800);
  }, [note.id, onUpdate]);

  const handleTitleChange = (val: string) => { setTitle(val); debouncedSave({ title: val }); };
  const handleContentChange = (val: string) => { setContent(val); debouncedSave({ content: val }); };

  const handleTypeToggle = () => {
    const newType = noteType === "note" ? "todo" : "note";
    setNoteType(newType);
    onUpdate(note.id, { note_type: newType });
  };

  const handleColorChange = (c: string | null) => {
    setColor(c);
    onUpdate(note.id, { color: c });
  };

  const selectedTags = allTags.filter(t => noteTagIds.includes(t.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card">
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
          {saveStatus === "saved" && <span className="text-[10px] text-primary">Saved</span>}
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-3">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full text-lg font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40"
            autoFocus
          />
          {noteType === "todo" ? (
            <TodoItems items={items} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} onReorder={reorderItems} />
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing..."
              className="w-full min-h-[300px] text-sm bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed"
            />
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedTags.map(tag => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} size="md" onRemove={() => onToggleTag(tag.id)} />
          ))}
          <TagManager allTags={allTags} selectedTagIds={noteTagIds} onToggleTag={onToggleTag} onCreateTag={onCreateTag} />
        </div>
        <NoteColorPicker value={color} onChange={handleColorChange} />
      </div>
    </div>
  );
}
