import { useRef, useEffect, KeyboardEvent } from "react";
import { Block } from "../block-types";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  focusId: string | null;
}

export function CodeBlock({ block, onUpdate, onEnter, onDelete, focusId }: Props) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (focusId === block.id && ref.current) {
      ref.current.focus();
    }
  }, [focusId, block.id]);

  const handleInput = () => { if (ref.current) onUpdate({ content: ref.current.innerText }); };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); onEnter(); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
    if (e.key === "Backspace" && !ref.current?.innerText) { e.preventDefault(); onDelete(); }
  };

  return (
    <div className="rounded-md bg-muted/50 border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 bg-muted/30 border-b border-border">
        <input
          value={block.language || ""}
          onChange={e => onUpdate({ language: e.target.value })}
          placeholder="language"
          className="text-[10px] bg-transparent border-none outline-none text-muted-foreground w-20"
        />
      </div>
      <pre
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Code..."
        className="outline-none text-xs font-mono p-3 text-foreground min-h-[2em] whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
        dangerouslySetInnerHTML={{ __html: block.content || "" }}
      />
    </div>
  );
}
