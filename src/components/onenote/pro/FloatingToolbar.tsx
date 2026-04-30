import { useEffect, useState, useRef } from "react";
import { Bold, Italic, Strikethrough, Code, Link } from "lucide-react";

export function FloatingToolbar() {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) { setPos(null); return; }
      const range = sel.getRangeAt(0);
      const text = sel.toString().trim();
      if (!text) { setPos(null); return; }
      const rect = range.getBoundingClientRect();
      setPos({ top: rect.top - 40 + window.scrollY, left: rect.left + rect.width / 2 - 80 });
    };
    document.addEventListener("selectionchange", check);
    return () => document.removeEventListener("selectionchange", check);
  }, []);

  if (!pos) return null;

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };

  const buttons = [
    { icon: Bold, cmd: "bold", label: "Bold" },
    { icon: Italic, cmd: "italic", label: "Italic" },
    { icon: Strikethrough, cmd: "strikeThrough", label: "Strike" },
    { icon: Code, cmd: "insertHTML", val: "<code>", label: "Code" },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-[110] flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-lg px-1 py-0.5"
      style={{ top: pos.top, left: Math.max(8, pos.left) }}
      onMouseDown={e => e.preventDefault()} // prevent selection loss
    >
      {buttons.map(b => (
        <button
          key={b.cmd}
          onClick={() => exec(b.cmd, b.val)}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          title={b.label}
        >
          <b.icon className="w-3.5 h-3.5 text-foreground" />
        </button>
      ))}
    </div>
  );
}
