import { Block } from "./block-types";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ListBlock } from "./blocks/ListBlock";
import { ChecklistBlock } from "./blocks/ChecklistBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { IdeaBlock } from "./blocks/IdeaBlock";
import { DecisionLogBlock } from "./blocks/DecisionLogBlock";
import { MoodEnergyBlock } from "./blocks/MoodEnergyBlock";
import { SprintBlock } from "./blocks/SprintBlock";

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
    case "idea":
      return <IdeaBlock block={block} onUpdate={onUpdate} />;
    case "decision_log":
      return <DecisionLogBlock block={block} onUpdate={onUpdate} />;
    case "mood_energy":
      return <MoodEnergyBlock block={block} onUpdate={onUpdate} />;
    case "sprint":
      return <SprintBlock block={block} onUpdate={onUpdate} />;
    default:
      return <ParagraphBlock block={block} onUpdate={onUpdate} onEnter={onEnter} onDelete={onDelete} onSlash={onSlash} focusId={focusId} />;
  }
}
