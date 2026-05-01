import { useState, useEffect, useRef, KeyboardEvent, useMemo } from "react";
import { BLOCK_MENU_ITEMS, BlockType } from "./block-types";
import { FF_FOUNDER_BLOCKS } from "@/lib/feature-flags";

interface Props {
  position: { top: number; left: number };
  onSelect: (type: BlockType, meta?: Record<string, any>) => void;
  onClose: () => void;
}

export function SlashCommandMenu({ position, onSelect, onClose }: Props) {
  const [filter, setFilter] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () => BLOCK_MENU_ITEMS.filter(item => FF_FOUNDER_BLOCKS || !item.founder),
    []
  );

  const filtered = visible.filter(item =>
    item.label.toLowerCase().includes(filter.toLowerCase()) ||
    item.description.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => { setActiveIdx(0); }, [filter]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[activeIdx]) { const item = filtered[activeIdx]; onSelect(item.type, item.meta); } }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-64 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b border-border">
        <input
          ref={inputRef}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Filter blocks..."
          className="w-full text-xs bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
        />
      </div>
      <div className="max-h-64 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3 text-center">No matches</p>
        ) : (
          filtered.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.type}-${item.label}`}
                onClick={() => onSelect(item.type, item.meta)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors ${
                  i === activeIdx ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-medium block">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">{item.description}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
