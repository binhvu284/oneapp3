import { useState, useCallback, useRef, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { useBlockEditor } from "./useBlockEditor";
import { BlockRenderer } from "./BlockRenderer";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { FloatingToolbar } from "./FloatingToolbar";
import { BlockType, extractPlainText } from "./block-types";
import { InlineAIPanel } from "./InlineAIPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FF_INLINE_AI } from "@/lib/feature-flags";

interface Props {
  content: string | null;
  onSave: (content: string) => void;
}

export function BlockEditor({ content, onSave }: Props) {
  const { blocks, updateBlock, addBlockAfter, removeBlock, moveBlock, changeBlockType } = useBlockEditor({ initialContent: content, onSave });
  const [focusId, setFocusId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; pos: { top: number; left: number } } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const [inlineAI, setInlineAI] = useState<{
    anchorId: string;
    pos: { top: number; left: number };
    context: { above: string[]; current: string; below: string[] };
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!FF_INLINE_AI) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.key === "j" && (e.metaKey || e.ctrlKey))) return;
      if (!containerRef.current) return;
      const target = e.target as HTMLElement | null;
      if (!target || !containerRef.current.contains(target)) return;
      e.preventDefault();
      const anchor = focusId ?? blocks[blocks.length - 1]?.id ?? null;
      if (!anchor) return;
      const idx = blocks.findIndex((b) => b.id === anchor);
      if (idx < 0) return;
      const above = blocks.slice(Math.max(0, idx - 3), idx).map((b) => extractPlainText({ blocks: [b] }));
      const current = extractPlainText({ blocks: [blocks[idx]] });
      const below = blocks.slice(idx + 1, idx + 4).map((b) => extractPlainText({ blocks: [b] }));
      const rect = (target.closest("[data-block-row]") as HTMLElement | null)?.getBoundingClientRect()
        ?? containerRef.current.getBoundingClientRect();
      setInlineAI({
        anchorId: anchor,
        pos: { top: rect.bottom + 6, left: rect.left + 24 },
        context: { above, current, below },
      });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [blocks, focusId]);

  const handleInlineInsert = useCallback(
    (text: string) => {
      if (!inlineAI) return;
      const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return;
      let prevId = inlineAI.anchorId;
      for (const part of parts) {
        prevId = addBlockAfter(prevId, "paragraph", { content: part });
      }
      setInlineAI(null);
      setTimeout(() => setFocusId(prevId), 10);
    },
    [inlineAI, addBlockAfter]
  );

  const handleEnter = useCallback((blockId: string) => {
    const newId = addBlockAfter(blockId);
    setTimeout(() => setFocusId(newId), 10);
  }, [addBlockAfter]);

  const handleDelete = useCallback((blockId: string, idx: number) => {
    if (blocks.length <= 1) return;
    const prevId = idx > 0 ? blocks[idx - 1].id : null;
    removeBlock(blockId);
    if (prevId) setTimeout(() => setFocusId(prevId), 10);
  }, [blocks, removeBlock]);

  const handleSlash = useCallback((blockId: string, rect: DOMRect) => {
    setSlashMenu({ blockId, pos: { top: rect.bottom + 4, left: rect.left } });
  }, []);

  const handleSlashSelect = useCallback((type: BlockType, meta?: Record<string, any>) => {
    if (!slashMenu) return;
    changeBlockType(slashMenu.blockId, type, meta);
    setSlashMenu(null);
    setTimeout(() => setFocusId(slashMenu.blockId), 10);
  }, [slashMenu, changeBlockType]);

  // Drag handlers
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDropIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx !== null && dragIdx !== idx) moveBlock(dragIdx, idx);
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  return (
    <div ref={containerRef} className="relative">
      <FloatingToolbar />
      <ScrollArea className="h-full">
        <div className="space-y-1 py-2">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              data-block-row
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`group flex items-start gap-1 px-1 rounded-md transition-all ${
                dragIdx === idx ? "opacity-40" : ""
              } ${dropIdx === idx && dragIdx !== idx ? "border-t-2 border-primary" : ""}`}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pt-1 shrink-0">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <BlockRenderer
                  block={block}
                  index={idx}
                  onUpdate={(updates) => updateBlock(block.id, updates)}
                  onEnter={() => handleEnter(block.id)}
                  onDelete={() => handleDelete(block.id, idx)}
                  onSlash={(rect) => handleSlash(block.id, rect)}
                  focusId={focusId}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {slashMenu && (
        <SlashCommandMenu
          position={slashMenu.pos}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu(null)}
        />
      )}
      {FF_INLINE_AI && inlineAI && (
        <InlineAIPanel
          position={inlineAI.pos}
          context={inlineAI.context}
          onInsert={handleInlineInsert}
          onClose={() => setInlineAI(null)}
        />
      )}
    </div>
  );
}
