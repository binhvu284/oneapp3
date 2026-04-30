import { useState, useCallback, useRef, useEffect } from "react";
import { Block, BlockContent, BlockType, createBlock, parseContent, serializeContent } from "./block-types";

interface UseBlockEditorProps {
  initialContent: string | null;
  onSave: (content: string) => void;
}

export function useBlockEditor({ initialContent, onSave }: UseBlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseContent(initialContent).blocks);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  // Re-init when note changes
  useEffect(() => {
    setBlocks(parseContent(initialContent).blocks);
  }, [initialContent]);

  const save = useCallback((newBlocks: Block[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(serializeContent({ blocks: newBlocks }));
    }, 800);
  }, [onSave]);

  const updateBlocks = useCallback((fn: (prev: Block[]) => Block[]) => {
    setBlocks(prev => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, [save]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    updateBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [updateBlocks]);

  const addBlockAfter = useCallback((afterId: string, type: BlockType = "paragraph", meta?: Partial<Block>) => {
    const newBlock = createBlock(type, meta);
    updateBlocks(prev => {
      const idx = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    return newBlock.id;
  }, [updateBlocks]);

  const addBlockAt = useCallback((index: number, type: BlockType = "paragraph", meta?: Partial<Block>) => {
    const newBlock = createBlock(type, meta);
    updateBlocks(prev => {
      const next = [...prev];
      next.splice(index, 0, newBlock);
      return next;
    });
    return newBlock.id;
  }, [updateBlocks]);

  const removeBlock = useCallback((id: string) => {
    updateBlocks(prev => {
      if (prev.length <= 1) return prev; // keep at least one block
      return prev.filter(b => b.id !== id);
    });
  }, [updateBlocks]);

  const moveBlock = useCallback((fromIdx: number, toIdx: number) => {
    updateBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, [updateBlocks]);

  const changeBlockType = useCallback((id: string, newType: BlockType, meta?: Partial<Block>) => {
    updateBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      const nb = createBlock(newType, { ...meta, content: b.content });
      nb.id = b.id; // keep same id
      return nb;
    }));
  }, [updateBlocks]);

  return { blocks, updateBlock, addBlockAfter, addBlockAt, removeBlock, moveBlock, changeBlockType, setBlocks: updateBlocks };
}
