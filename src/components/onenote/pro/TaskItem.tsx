import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GripVertical, Trash2, ChevronDown, ChevronRight, Plus, CalendarDays, Flag } from "lucide-react";
import { NoteItem } from "@/hooks/useNoteItems";
import { format, isAfter, isBefore, startOfDay } from "date-fns";

const PRIORITY_COLORS: Record<string, string> = {
  high: "hsl(0 84% 60%)",
  medium: "hsl(25 95% 53%)",
  low: "hsl(217 91% 60%)",
};

interface Props {
  item: NoteItem;
  subItems: NoteItem[];
  onUpdate: (id: string, updates: Partial<NoteItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onAddSub: (parentId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  isDropTarget?: boolean;
  isSub?: boolean;
}

export function TaskItem({
  item, subItems, onUpdate, onDelete, onAddSub, expanded, onToggleExpand,
  draggable, onDragStart, onDragOver, onDrop, onDragEnd, isDropTarget, isSub,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(item.content || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setContent(item.content || ""); }, [item.content]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const isOverdue = item.due_date && isBefore(new Date(item.due_date), startOfDay(new Date())) && !item.is_completed;

  const handleBlur = () => {
    setEditing(false);
    if (content !== item.content) onUpdate(item.id, { content });
  };

  const priorityDot = item.priority && PRIORITY_COLORS[item.priority] ? (
    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[item.priority] }} />
  ) : null;

  return (
    <div className={`${isDropTarget ? "border-t-2 border-primary" : ""}`}>
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={`group flex items-center gap-1.5 py-1 px-1 rounded-md hover:bg-muted/40 transition-colors ${isSub ? "ml-6" : ""}`}
      >
        {!isSub && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0">
            <GripVertical className="w-3 h-3 text-muted-foreground/50" />
          </div>
        )}
        {!isSub && subItems.length > 0 && (
          <button onClick={onToggleExpand} className="shrink-0 p-0.5">
            {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </button>
        )}
        {!isSub && subItems.length === 0 && <span className="w-4" />}

        <Checkbox
          checked={item.is_completed}
          onCheckedChange={(v) => onUpdate(item.id, { is_completed: !!v })}
          className="shrink-0"
        />

        {priorityDot}

        {editing ? (
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === "Enter") handleBlur(); }}
            className={`flex-1 text-sm bg-transparent border-none outline-none ${item.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            className={`flex-1 text-sm cursor-text truncate ${item.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}
          >
            {item.content || "Untitled task"}
          </span>
        )}

        {/* Due date badge */}
        {item.due_date && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${isOverdue ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
            {format(new Date(item.due_date), "MMM d")}
          </span>
        )}

        {/* Inline action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {/* Due date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1 rounded hover:bg-muted"><CalendarDays className="w-3 h-3 text-muted-foreground" /></button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border z-50" align="end">
              <Calendar
                mode="single"
                selected={item.due_date ? new Date(item.due_date) : undefined}
                onSelect={(d) => onUpdate(item.id, { due_date: d ? d.toISOString() : null })}
              />
            </PopoverContent>
          </Popover>

          {/* Priority picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-muted"><Flag className="w-3 h-3 text-muted-foreground" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-28 bg-popover border z-50">
              {(["high", "medium", "low", null] as (string | null)[]).map((p) => (
                <DropdownMenuItem key={p || "none"} onClick={() => onUpdate(item.id, { priority: p })}>
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p ? PRIORITY_COLORS[p] : "hsl(var(--muted-foreground))" }} />
                  {p ? p.charAt(0).toUpperCase() + p.slice(1) : "None"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isSub && (
            <button onClick={() => onAddSub(item.id)} className="p-1 rounded hover:bg-muted" title="Add sub-task">
              <Plus className="w-3 h-3 text-muted-foreground" />
            </button>
          )}

          <button onClick={() => onDelete(item.id)} className="p-1 rounded hover:bg-muted">
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Sub-tasks */}
      {expanded && subItems.map((sub) => (
        <TaskItem
          key={sub.id}
          item={sub}
          subItems={[]}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddSub={() => {}}
          expanded={false}
          onToggleExpand={() => {}}
          isSub
        />
      ))}
    </div>
  );
}
