import { Badge } from "@/components/ui/badge";

interface TagBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  onRemove?: () => void;
}

export function TagBadge({ name, color, size = "sm", onRemove }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"} border-transparent font-normal cursor-default`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 hover:opacity-70"
        >
          ×
        </button>
      )}
    </Badge>
  );
}
