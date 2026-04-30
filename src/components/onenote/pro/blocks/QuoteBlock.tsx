import { useRef, useEffect, KeyboardEvent } from "react";
import { Block } from "../block-types";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  focusId: string | null;
}

export function QuoteBlock({ block, onUpdate, onEnter, onDelete, focusId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

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
    <div className="border-l-3 border-primary/40 pl-3 py-0.5">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Quote..."
        className="outline-none text-sm italic text-muted-foreground leading-relaxed min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
        dangerouslySetInnerHTML={{ __html: block.content || "" }}
      />
    </div>
  );
}
