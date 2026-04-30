import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(content: string): TOCItem[] {
  const lines = content.split("\n");
  const items: TOCItem[] = [];
  for (const line of lines) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").replace(/`/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      items.push({ id, text, level });
    }
  }
  return items;
}

interface DocsTOCProps {
  content: string;
}

export function DocsTOC({ content }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(content);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content]);

  if (headings.length < 2) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        On this page
      </p>
      {headings.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveId(item.id);
          }}
          className={cn(
            "block text-sm py-1 transition-colors leading-snug",
            item.level === 2 ? "pl-0" : item.level === 3 ? "pl-3" : "pl-6",
            activeId === item.id
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
