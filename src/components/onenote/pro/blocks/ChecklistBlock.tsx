import { useRef, useEffect, KeyboardEvent } from "react";
import { Block, ChecklistItem } from "../block-types";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  focusId: string | null;
}

export function ChecklistBlock({ block, onUpdate, focusId }: Props) {
  const items = block.items || [];

  const toggleItem = (itemId: string) => {
    onUpdate({ items: items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) });
  };

  const updateItemContent = (itemId: string, content: string) => {
    onUpdate({ items: items.map(i => i.id === itemId ? { ...i, content } : i) });
  };

  const addItem = (afterId: string) => {
    const idx = items.findIndex(i => i.id === afterId);
    const newItems = [...items];
    newItems.splice(idx + 1, 0, { id: crypto.randomUUID(), content: "", checked: false });
    onUpdate({ items: newItems });
  };

  const removeItem = (itemId: string) => {
    if (items.length <= 1) return;
    onUpdate({ items: items.filter(i => i.id !== itemId) });
  };

  return (
    <div className="space-y-1">
      {items.map(item => (
        <ChecklistItemRow
          key={item.id}
          item={item}
          onToggle={() => toggleItem(item.id)}
          onContentChange={(c) => updateItemContent(item.id, c)}
          onEnter={() => addItem(item.id)}
          onDelete={() => removeItem(item.id)}
          autoFocus={focusId === block.id && item === items[items.length - 1]}
        />
      ))}
    </div>
  );
}

function ChecklistItemRow({ item, onToggle, onContentChange, onEnter, onDelete, autoFocus }: {
  item: ChecklistItem;
  onToggle: () => void;
  onContentChange: (c: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  autoFocus: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(); }
    if (e.key === "Backspace" && !ref.current?.innerText) { e.preventDefault(); onDelete(); }
  };

  return (
    <div className="flex items-start gap-2">
      <button onClick={onToggle} className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${item.checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"}`}>
        {item.checked && <span className="text-[10px]">✓</span>}
      </button>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onContentChange(ref.current.innerText); }}
        onKeyDown={handleKeyDown}
        data-placeholder="Todo item..."
        className={`outline-none text-sm flex-1 min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    </div>
  );
}
