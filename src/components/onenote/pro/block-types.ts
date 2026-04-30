import { Heading1, Heading2, Heading3, Type, List, ListOrdered, CheckSquare, Quote, Code, Minus } from "lucide-react";

export type BlockType = "paragraph" | "heading" | "bullet_list" | "numbered_list" | "checklist" | "quote" | "code" | "divider";

export interface ChecklistItem {
  id: string;
  content: string;
  checked: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  level?: 1 | 2 | 3; // for headings
  language?: string; // for code
  items?: ChecklistItem[]; // for checklist
}

export interface BlockContent {
  blocks: Block[];
}

export function createBlock(type: BlockType, overrides?: Partial<Block>): Block {
  const base: Block = { id: crypto.randomUUID(), type, content: "" };
  if (type === "heading") base.level = overrides?.level ?? 2;
  if (type === "code") base.language = overrides?.language ?? "";
  if (type === "checklist") {
    base.items = overrides?.items ?? [{ id: crypto.randomUUID(), content: "", checked: false }];
    delete base.content;
  }
  if (type === "divider") delete base.content;
  return { ...base, ...overrides, id: base.id };
}

export function parseContent(raw: string | null): BlockContent {
  if (!raw) return { blocks: [createBlock("paragraph")] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.blocks && Array.isArray(parsed.blocks)) return parsed;
  } catch (_e) {
    // Ignore, fallback to paragraph
  }
  // Plain text fallback: wrap in paragraph
  return { blocks: [createBlock("paragraph", { content: raw })] };
}

export function serializeContent(bc: BlockContent): string {
  return JSON.stringify(bc);
}

// Extract plain text for Simple Mode compatibility
export function extractPlainText(bc: BlockContent): string {
  return bc.blocks
    .map(b => {
      if (b.type === "divider") return "---";
      if (b.type === "checklist") return (b.items || []).map(i => `${i.checked ? "[x]" : "[ ]"} ${i.content}`).join("\n");
      return b.content || "";
    })
    .join("\n\n");
}

export const BLOCK_MENU_ITEMS = [
  { type: "paragraph" as BlockType, label: "Text", description: "Plain text paragraph", icon: Type },
  { type: "heading" as BlockType, label: "Heading 1", description: "Large heading", icon: Heading1, meta: { level: 1 } },
  { type: "heading" as BlockType, label: "Heading 2", description: "Medium heading", icon: Heading2, meta: { level: 2 } },
  { type: "heading" as BlockType, label: "Heading 3", description: "Small heading", icon: Heading3, meta: { level: 3 } },
  { type: "bullet_list" as BlockType, label: "Bullet List", description: "Unordered list", icon: List },
  { type: "numbered_list" as BlockType, label: "Numbered List", description: "Ordered list", icon: ListOrdered },
  { type: "checklist" as BlockType, label: "Checklist", description: "Todo items", icon: CheckSquare },
  { type: "quote" as BlockType, label: "Quote", description: "Blockquote", icon: Quote },
  { type: "code" as BlockType, label: "Code", description: "Code block", icon: Code },
  { type: "divider" as BlockType, label: "Divider", description: "Horizontal rule", icon: Minus },
];
