import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useNoteItems, NoteItem } from "@/hooks/useNoteItems";
import { TaskItem } from "./TaskItem";
import { TaskFilters, TaskFilter } from "./TaskFilters";
import { isToday, isAfter, isBefore, startOfDay, addDays } from "date-fns";

interface Props {
  noteId: string;
  title: string;
  onTitleChange: (t: string) => void;
}

export function TaskView({ noteId, title, onTitleChange }: Props) {
  const { items, isLoading, fetchItems, addItem, updateItem, deleteItem, reorderItems } = useNoteItems(noteId);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [completedOpen, setCompletedOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  useEffect(() => { fetchItems(); }, [noteId, fetchItems]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addItem(newTask.trim());
    setNewTask("");
  };

  const handleAddSubTask = async (parentId: string) => {
    await addItem("");
    // Set parent_item_id on the newly created item
    const latest = items[items.length]; // Won't work since state hasn't updated
    // Instead, create with content and then update parent
    const newItem = await addItem("");
    if (newItem) {
      await updateItem(newItem.id, { parent_item_id: parentId } as any);
      setExpandedItems(prev => new Set([...prev, parentId]));
    }
  };

  // Organize items into parent/child structure
  const { parentItems, childMap, activeItems, completedItems } = useMemo(() => {
    const childMap: Record<string, NoteItem[]> = {};
    const parents: NoteItem[] = [];

    items.forEach(item => {
      const pid = (item as any).parent_item_id;
      if (pid) {
        if (!childMap[pid]) childMap[pid] = [];
        childMap[pid].push(item);
      } else {
        parents.push(item);
      }
    });

    const today = startOfDay(new Date());
    const weekFromNow = addDays(today, 7);

    const filterFn = (item: NoteItem) => {
      if (filter === "all") return true;
      if (!item.due_date) return false;
      const d = new Date(item.due_date);
      if (filter === "today") return isToday(d);
      if (filter === "upcoming") return isAfter(d, today) && isBefore(d, weekFromNow);
      if (filter === "overdue") return isBefore(d, today) && !item.is_completed;
      return true;
    };

    const active = parents.filter(i => !i.is_completed && filterFn(i));
    const completed = parents.filter(i => i.is_completed && filterFn(i));

    return { parentItems: parents, childMap, activeItems: active, completedItems: completed };
  }, [items, filter]);

  // Drag handlers for parent items
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDropIdx(idx); };
  const handleDrop = (idx: number) => {
    if (dragIdx !== null && dragIdx !== idx) {
      const reordered = [...activeItems];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(idx, 0, moved);
      reorderItems(reordered);
    }
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="px-4 pt-3 pb-1 shrink-0">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Task list title..."
          className="w-full text-xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30"
        />
      </div>

      {/* Filters */}
      <div className="px-4 py-1.5 shrink-0">
        <TaskFilters value={filter} onChange={setFilter} />
      </div>

      {/* Add task input */}
      <div className="px-4 py-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Add a task..."
            className="h-8 text-sm border-none shadow-none bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
        <div className="border-b border-border mt-1" />
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 py-1 space-y-0.5">
          {activeItems.map((item, idx) => (
            <TaskItem
              key={item.id}
              item={item}
              subItems={childMap[item.id] || []}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onAddSub={handleAddSubTask}
              expanded={expandedItems.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              isDropTarget={dropIdx === idx && dragIdx !== idx}
            />
          ))}

          {activeItems.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground text-center py-6">No tasks{filter !== "all" ? ` for "${filter}"` : ""}. Add one above.</p>
          )}
        </div>

        {/* Completed section */}
        {completedItems.length > 0 && (
          <div className="px-3 py-1">
            <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1.5 w-full">
                <ChevronDown className={`w-3 h-3 transition-transform ${completedOpen ? "" : "-rotate-90"}`} />
                Completed ({completedItems.length})
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5 opacity-60">
                  {completedItems.map((item) => (
                    <TaskItem
                      key={item.id}
                      item={item}
                      subItems={childMap[item.id] || []}
                      onUpdate={updateItem}
                      onDelete={deleteItem}
                      onAddSub={() => { }}
                      expanded={false}
                      onToggleExpand={() => { }}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
