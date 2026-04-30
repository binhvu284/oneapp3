import { Button } from "@/components/ui/button";

export type TaskFilter = "all" | "today" | "upcoming" | "overdue";

interface Props {
  value: TaskFilter;
  onChange: (f: TaskFilter) => void;
}

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
];

export function TaskFilters({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {FILTERS.map((f) => (
        <Button
          key={f.value}
          size="sm"
          variant={value === f.value ? "default" : "ghost"}
          className="h-6 px-2.5 text-[11px]"
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
