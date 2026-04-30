import { useRef, useEffect, KeyboardEvent } from "react";
import { Block } from "../block-types";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  focusId: string | null;
}

const STYLES: Record<number, string> = {
  1: "text-2xl font-bold",
  2: "text-xl font-semibold",
  3: "text-lg font-medium",
};

export function HeadingBlock({ block, onUpdate, onEnter, onDelete, focusId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const level = block.level || 2;

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
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={`Heading ${level}`}
      className={`outline-none ${STYLES[level]} text-foreground min-h-[1.2em] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40`}
      dangerouslySetInnerHTML={{ __html: block.content || "" }}
    />
  );
}
