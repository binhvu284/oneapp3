import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, X, Check, Battery, Zap } from "lucide-react";
import { useTodayMood, EnergyLevel } from "@/hooks/useTodayMood";
import { FF_MOOD_ROUTING } from "@/lib/feature-flags";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  energy?: EnergyLevel;
}

interface TodoWidgetProps {
  config?: Record<string, any>;
  onConfigChange?: (c: Record<string, any>) => void;
}

export default function TodoWidget({ config, onConfigChange }: TodoWidgetProps) {
  const [todos, setTodos] = useState<TodoItem[]>(config?.todos ?? []);
  const [input, setInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (config?.todos && JSON.stringify(config.todos) !== JSON.stringify(todos)) {
      setTodos(config.todos);
    }
  }, [config?.todos]);

  const save = (items: TodoItem[]) => {
    setTodos(items);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onConfigChange?.({ todos: items });
    }, 800);
  };

  const addTodo = () => {
    if (!input.trim()) return;
    save([...todos, { id: Date.now().toString(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    save(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTodo = (id: string) => {
    save(todos.filter((t) => t.id !== id));
  };

  const remaining = todos.filter((t) => !t.done).length;
  const { data: mood } = useTodayMood();
  const moodLevel = FF_MOOD_ROUTING ? mood?.level ?? null : null;

  const orderedTodos = useMemo(() => {
    if (!moodLevel) return todos;
    const score = (t: TodoItem) => {
      if (t.energy === moodLevel) return 0;
      if (!t.energy) return 1;
      return 2;
    };
    return [...todos].sort((a, b) => score(a) - score(b));
  }, [todos, moodLevel]);

  const cycleEnergy = (id: string) => {
    save(
      todos.map((t) => {
        if (t.id !== id) return t;
        const next: EnergyLevel = !t.energy ? "low" : t.energy === "low" ? "deep" : null;
        return { ...t, energy: next };
      })
    );
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Input */}
      <div className="flex gap-1.5 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className="flex-1 text-xs bg-muted/50 border border-border rounded-md px-2 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          onClick={addTodo}
          className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto space-y-1">
        {todos.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 text-center mt-4">No tasks yet</p>
        )}
        {orderedTodos.map((todo) => {
          const matchesMood = moodLevel && todo.energy === moodLevel;
          return (
            <div
              key={todo.id}
              className={`flex items-center gap-1.5 group px-1 py-1 rounded-md transition-colors ${
                matchesMood ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30"
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                  todo.done
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {todo.done && <Check className="w-2.5 h-2.5" />}
              </button>
              <span
                className={`text-xs flex-1 truncate ${
                  todo.done ? "line-through text-muted-foreground/50" : "text-foreground"
                }`}
              >
                {todo.text}
              </span>
              {FF_MOOD_ROUTING && (
                <button
                  onClick={() => cycleEnergy(todo.id)}
                  className={`opacity-60 group-hover:opacity-100 p-0.5 transition-all ${
                    todo.energy === "low"
                      ? "text-emerald-400"
                      : todo.energy === "deep"
                      ? "text-violet-400"
                      : "text-muted-foreground"
                  }`}
                  title={
                    todo.energy === "low"
                      ? "Low-energy task"
                      : todo.energy === "deep"
                      ? "Deep-work task"
                      : "Tap to tag energy"
                  }
                >
                  {todo.energy === "deep" ? <Zap className="w-3 h-3" /> : <Battery className="w-3 h-3" />}
                </button>
              )}
              <button
                onClick={() => removeTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {todos.length > 0 && (
        <p className="text-[10px] text-muted-foreground shrink-0">
          {remaining} remaining
        </p>
      )}
    </div>
  );
}
