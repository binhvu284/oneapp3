import { Heading1, Heading2, Heading3, Type, List, ListOrdered, CheckSquare, Quote, Code, Minus, Lightbulb, Scale, HeartPulse, Kanban } from "lucide-react";

export type BlockType =
  | "paragraph"
  | "heading"
  | "bullet_list"
  | "numbered_list"
  | "checklist"
  | "quote"
  | "code"
  | "divider"
  | "idea"
  | "decision_log"
  | "mood_energy"
  | "sprint";

export interface ChecklistItem {
  id: string;
  content: string;
  checked: boolean;
}

export type IdeaStatus = "untested" | "validated" | "invalidated";
export interface IdeaPayload {
  hypothesis: string;
  validation_status: IdeaStatus;
  confidence: 1 | 2 | 3 | 4 | 5;
}

export type DecisionOutcome = "pending" | "good" | "bad";
export interface DecisionLogPayload {
  decision: string;
  reasoning: string;
  decided_at: string; // ISO
  outcome: DecisionOutcome;
  unlock_reason?: string;
}

export interface MoodEnergyPayload {
  energy: 1 | 2 | 3 | 4 | 5;
  mood: string; // emoji
  note?: string;
  recorded_at: string; // ISO
}

export type SprintColumn = "todo" | "in_progress" | "done";
export interface SprintCard {
  id: string;
  title: string;
  column: SprintColumn;
}
export interface SprintPayload {
  cards: SprintCard[];
}

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  level?: 1 | 2 | 3; // for headings
  language?: string; // for code
  items?: ChecklistItem[]; // for checklist
  idea?: IdeaPayload;
  decision?: DecisionLogPayload;
  mood?: MoodEnergyPayload;
  sprint?: SprintPayload;
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
  if (type === "idea") {
    base.idea = overrides?.idea ?? { hypothesis: "", validation_status: "untested", confidence: 3 };
    delete base.content;
  }
  if (type === "decision_log") {
    base.decision = overrides?.decision ?? {
      decision: "",
      reasoning: "",
      decided_at: new Date().toISOString(),
      outcome: "pending",
    };
    delete base.content;
  }
  if (type === "mood_energy") {
    base.mood = overrides?.mood ?? { energy: 3, mood: "🙂", note: "", recorded_at: new Date().toISOString() };
    delete base.content;
  }
  if (type === "sprint") {
    base.sprint = overrides?.sprint ?? { cards: [] };
    delete base.content;
  }
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
      if (b.type === "idea" && b.idea) return `💡 ${b.idea.hypothesis} (${b.idea.validation_status}, confidence ${b.idea.confidence})`;
      if (b.type === "decision_log" && b.decision) return `⚖️ ${b.decision.decision} — ${b.decision.reasoning}`;
      if (b.type === "mood_energy" && b.mood) return `${b.mood.mood} energy=${b.mood.energy}${b.mood.note ? " — " + b.mood.note : ""}`;
      if (b.type === "sprint" && b.sprint) return b.sprint.cards.map(c => `[${c.column}] ${c.title}`).join("\n");
      return b.content || "";
    })
    .join("\n\n");
}

export interface BlockMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: typeof Type;
  meta?: Partial<Block>;
  founder?: boolean;
}

export const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  { type: "paragraph", label: "Text", description: "Plain text paragraph", icon: Type },
  { type: "heading", label: "Heading 1", description: "Large heading", icon: Heading1, meta: { level: 1 } },
  { type: "heading", label: "Heading 2", description: "Medium heading", icon: Heading2, meta: { level: 2 } },
  { type: "heading", label: "Heading 3", description: "Small heading", icon: Heading3, meta: { level: 3 } },
  { type: "bullet_list", label: "Bullet List", description: "Unordered list", icon: List },
  { type: "numbered_list", label: "Numbered List", description: "Ordered list", icon: ListOrdered },
  { type: "checklist", label: "Checklist", description: "Todo items", icon: CheckSquare },
  { type: "quote", label: "Quote", description: "Blockquote", icon: Quote },
  { type: "code", label: "Code", description: "Code block", icon: Code },
  { type: "divider", label: "Divider", description: "Horizontal rule", icon: Minus },
  { type: "idea", label: "Idea", description: "Hypothesis + validation status", icon: Lightbulb, founder: true },
  { type: "decision_log", label: "Decision Log", description: "Decision + reasoning, locks after 24h", icon: Scale, founder: true },
  { type: "mood_energy", label: "Mood / Energy", description: "Today's energy & mood check-in", icon: HeartPulse, founder: true },
  { type: "sprint", label: "Sprint", description: "Mini kanban inside a note", icon: Kanban, founder: true },
];

export const DECISION_LOCK_MS = 24 * 60 * 60 * 1000;
export const SPRINT_MAX_CARDS = 10;
