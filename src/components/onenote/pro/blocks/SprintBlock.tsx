import { Block, SprintCard, SprintColumn, SprintPayload, SPRINT_MAX_CARDS } from "../block-types";
import { Kanban, Plus, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const COLUMNS: SprintColumn[] = ["todo", "in_progress", "done"];

export function SprintBlock({ block, onUpdate }: Props) {
  const { t } = useLanguage();
  const sprint: SprintPayload = block.sprint ?? { cards: [] };

  const update = (cards: SprintCard[]) => onUpdate({ sprint: { cards } });

  const addCard = (column: SprintColumn) => {
    if (sprint.cards.length >= SPRINT_MAX_CARDS) return;
    update([...sprint.cards, { id: crypto.randomUUID(), title: "", column }]);
  };

  const editCard = (id: string, title: string) => {
    update(sprint.cards.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const moveCard = (id: string, column: SprintColumn) => {
    update(sprint.cards.map((c) => (c.id === id ? { ...c, column } : c)));
  };

  const removeCard = (id: string) => update(sprint.cards.filter((c) => c.id !== id));

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (e: React.DragEvent, column: SprintColumn) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveCard(id, column);
  };

  const labels: Record<SprintColumn, string> = {
    todo: t("onenote.sprint.todo"),
    in_progress: t("onenote.sprint.inProgress"),
    done: t("onenote.sprint.done"),
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Kanban className="w-3.5 h-3.5 text-violet-400" />
        <span className="font-medium uppercase tracking-wider">{t("onenote.block.sprint")}</span>
        <span className="ml-auto text-[10px]">
          {sprint.cards.length}/{SPRINT_MAX_CARDS}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col)}
            className="rounded-md bg-muted/30 p-1.5 min-h-[80px] flex flex-col gap-1"
          >
            <div className="text-[10px] font-medium text-muted-foreground px-1">{labels[col]}</div>
            {sprint.cards
              .filter((c) => c.column === col)
              .map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, c.id)}
                  className="bg-background border border-border rounded px-1.5 py-1 flex items-center gap-1"
                >
                  <input
                    value={c.title}
                    onChange={(e) => editCard(c.id, e.target.value)}
                    className="flex-1 bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/40"
                    placeholder="Card title"
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(c.id)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="remove card"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            <button
              type="button"
              onClick={() => addCard(col)}
              disabled={sprint.cards.length >= SPRINT_MAX_CARDS}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1 py-0.5 disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
              {t("onenote.sprint.add")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
