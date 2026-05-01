import type { Block, BlockContent } from "@/components/onenote/pro/block-types";

const LINK_RE = /\[\[([^[\]]{1,200})\]\]/g;

/**
 * Extract `[[link target]]` titles from a block's text-bearing fields.
 * Founder blocks expose their text via dedicated fields (hypothesis, decision,
 * etc.), so we scan those too — links from any user-typed string count.
 */
export function extractLinkTitlesFromBlock(b: Block): string[] {
  const sources: string[] = [];
  if (typeof b.content === "string") sources.push(b.content);
  if (b.idea?.hypothesis) sources.push(b.idea.hypothesis);
  if (b.decision) sources.push(b.decision.decision, b.decision.reasoning);
  if (b.mood?.note) sources.push(b.mood.note);
  if (b.sprint) sources.push(...b.sprint.cards.map(c => c.title));
  if (b.items) sources.push(...b.items.map(i => i.content));

  const titles: string[] = [];
  for (const s of sources) {
    let match: RegExpExecArray | null;
    LINK_RE.lastIndex = 0;
    while ((match = LINK_RE.exec(s)) !== null) {
      const t = match[1].trim();
      if (t) titles.push(t);
    }
  }
  return titles;
}

export function extractLinkTitlesFromContent(bc: BlockContent): string[] {
  const all = bc.blocks.flatMap(extractLinkTitlesFromBlock);
  return Array.from(new Set(all));
}
