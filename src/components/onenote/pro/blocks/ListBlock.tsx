import { useRef, useEffect, KeyboardEvent } from "react";
import { Block } from "../block-types";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  focusId: string | null;
  index: number;
}

export function ListBlock({ block, onUpdate, onEnter, onDelete, focusId, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isBullet = block.type === "bullet_list";

  useEffect(() => {
    if (focusId === block.id && ref.current) {
      ref.current.focus();
      const sel = window.getSelection();
      if (sel && ref.current.childNodes.length) { sel.selectAllChildren(ref.current); sel.collapseToEnd(); }
    }
  }, [focusId, block.id]);

  const handleInput = () => { if (ref.current) onUpdate({ content: ref.current.innerText }); };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(); }
    if (e.key === "Backspace" && !ref.current?.innerText) { e.preventDefault(); onDelete(); }
  };

  return (
    <div className="flex items-start gap-2">
      <span className="text-sm text-muted-foreground mt-0.5 w-5 shrink-0 text-right select-none">
        {isBullet ? "•" : `${index + 1}.`}
      </span>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="List item..."
        className="outline-none text-sm leading-relaxed text-foreground flex-1 min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
        dangerouslySetInnerHTML={{ __html: block.content || "" }}
      />
    </div>
  );
}
