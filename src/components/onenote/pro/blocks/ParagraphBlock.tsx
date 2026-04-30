import { useRef, useEffect, KeyboardEvent } from "react";
import { Block } from "../block-types";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  onSlash: (rect: DOMRect) => void;
  focusId: string | null;
}

export function ParagraphBlock({ block, onUpdate, onEnter, onDelete, onSlash, focusId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusId === block.id && ref.current) {
      ref.current.focus();
      // move cursor to end
      const sel = window.getSelection();
      if (sel && ref.current.childNodes.length) {
        sel.selectAllChildren(ref.current);
        sel.collapseToEnd();
      }
    }
  }, [focusId, block.id]);

  const handleInput = () => {
    if (ref.current) onUpdate({ content: ref.current.innerText });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
    if (e.key === "Backspace" && !ref.current?.innerText) {
      e.preventDefault();
      onDelete();
    }
    if (e.key === "/" && !ref.current?.innerText) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) onSlash(rect);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder="Type '/' for commands..."
      className="outline-none text-sm leading-relaxed text-foreground min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
      dangerouslySetInnerHTML={{ __html: block.content || "" }}
    />
  );
}
