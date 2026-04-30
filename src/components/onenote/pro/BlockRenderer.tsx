import { Block } from "./block-types";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ListBlock } from "./blocks/ListBlock";
import { ChecklistBlock } from "./blocks/ChecklistBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { DividerBlock } from "./blocks/DividerBlock";

interface Props {
  block: Block;
  index: number;
  onUpdate: (updates: Partial<Block>) => void;
  onEnter: () => void;
  onDelete: () => void;
  onSlash: (rect: DOMRect) => void;
  focusId: string | null;
}

export function BlockRenderer({ block, index, onUpdate, onEnter, onDelete, onSlash, focusId }: Props) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} onSlash={onSlash} focusId={focusId} />;
    case "heading":
      return <HeadingBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} focusId={focusId} />;
    case "bullet_list":
    case "numbered_list":
      return <ListBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} focusId={focusId} index={index} />;
    case "checklist":
      return <ChecklistBlock block={block} onUpdate={onUpdate} focusId={focusId} />;
    case "quote":
      return <QuoteBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} focusId={focusId} />;
    case "code":
      return <CodeBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} focusId={focusId} />;
    case "divider":
      return <DividerBlock />;
    default:
      return <ParagraphBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} onSlash={onSlash} focusId={focusId} />;
  }
}
