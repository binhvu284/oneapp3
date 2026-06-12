import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useDataQuery } from "@/lib/data-layer";
import { buildNoteGraph, type NoteRow } from "@/lib/dashboard-metrics";
import { WidgetEmpty } from "./WidgetEmpty";

/**
 * Phase 4 M5 — Canvas Dashboard 3.0. Mini visualization of the note connection
 * graph (parent → child links). Reads `notes` via the data-layer.
 */
export default function NoteGraphWidget() {
  const { user } = useAuthSafe();
  const { data } = useDataQuery<NoteRow>("notes", {
    queryOptions: {
      select: ["id", "title", "parent_id"],
      filters: [
        { column: "user_id", operator: "eq", value: user?.id ?? "" },
        { column: "is_archived", operator: "eq", value: false },
      ],
      order: [{ column: "updated_at", ascending: false }],
      limit: 8,
    },
    enabled: !!user,
  });

  const notes = (data?.data as NoteRow[] | null) ?? [];
  const { nodes, edges } = buildNoteGraph(notes);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  if (nodes.length === 0) {
    return <WidgetEmpty message="No notes to graph yet" />;
  }

  return (
    <div className="h-full w-full">
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {edges.map((e) => {
          const a = nodeById.get(e.from);
          const b = nodeById.get(e.to);
          if (!a || !b) return null;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="hsl(var(--border))"
              strokeWidth="0.6"
            />
          );
        })}
        {nodes.map((n, i) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={i === 0 ? 4 : 2.6}
              fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
