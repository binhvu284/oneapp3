import { useState, useRef } from "react";
import { Plus, Check, X, GripVertical, Trash2 } from "lucide-react";
import { NoteItem } from "@/hooks/useNoteItems";

interface TodoItemsProps {
  items: NoteItem[];
  onAdd: (content: string) => Promise<any>;
  onUpdate: (id: string, updates: Partial<NoteItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (items: NoteItem[]) => Promise<void>;
}

export function TodoItems({ items, onAdd, onUpdate, onDelete, onReorder }: TodoItemsProps) {
  const [newText, setNewText] = useState("");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    await onAdd(newText.trim());
    setNewText("");
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const reordered = [...items];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    dragItem.current = null;
    dragOverItem.current = null;
    onReorder(reordered);
  };

  // Sort: incomplete first, then completed
  const sortedItems = [...items].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return a.sort_order - b.sort_order;
  });

  return (
    <div className="space-y-1">
      {/* Add new item */}
      <div className="flex gap-1.5 mb-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add item..."
          className="flex-1 text-sm bg-muted/50 border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button onClick={handleAdd} className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-0.5">
        {sortedItems.map((item, idx) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={handleDrop}
            className="flex items-center gap-1.5 group px-1 py-1.5 rounded-md hover:bg-muted/30 transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0" />
            <button
              onClick={() => onUpdate(item.id, { is_completed: !item.is_completed })}
              className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                item.is_completed
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {item.is_completed && <Check className="w-2.5 h-2.5" />}
            </button>
            <input
              value={item.content}
              onChange={(e) => onUpdate(item.id, { content: e.target.value })}
              className={`flex-1 text-sm bg-transparent border-none outline-none ${
                item.is_completed ? "line-through text-muted-foreground/50" : "text-foreground"
              }`}
              placeholder="Item content..."
            />
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <p className="text-[10px] text-muted-foreground pt-1">
          {items.filter(i => i.is_completed).length}/{items.length} completed
        </p>
      )}
    </div>
  );
}
