import { useNavigate } from "react-router-dom";
import { Sunrise } from "lucide-react";
import { useDailyBriefing } from "@/hooks/useDailyBriefing";
import { useLanguage } from "@/hooks/useLanguage";

interface ParsedBlock {
  type: string;
  level?: number;
  content?: string;
  items?: { content: string; checked: boolean }[];
}

export default function DailyBriefingWidget() {
  const { t } = useLanguage();
  const { data: briefing, isLoading } = useDailyBriefing();
  const navigate = useNavigate();

  const sections: { heading: string; lines: string[] }[] = [];
  if (briefing) {
    try {
      const parsed = JSON.parse(briefing.content || "{}");
      const blocks = (parsed.blocks ?? []) as ParsedBlock[];
      let cur: { heading: string; lines: string[] } | null = null;
      for (const b of blocks) {
        if (b.type === "heading" && b.level === 2) {
          if (cur) sections.push(cur);
          cur = { heading: b.content ?? "", lines: [] };
        } else if (cur) {
          if (b.type === "paragraph" && b.content && b.content !== "—") {
            cur.lines.push(b.content);
          } else if (b.type === "checklist" && b.items) {
            for (const it of b.items) cur.lines.push(`☐ ${it.content}`);
          }
        }
      }
      if (cur) sections.push(cur);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="h-full flex flex-col bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => briefing && navigate(`/apps/onenote`)}
    >
      <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
        <Sunrise className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-medium uppercase tracking-wider">{t("dashboard.briefing.title")}</span>
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground/60">…</p>
      ) : !briefing ? (
        <p className="text-xs text-muted-foreground/60">{t("dashboard.briefing.empty")}</p>
      ) : sections.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">{briefing.title}</p>
      ) : (
        <div className="space-y-2 overflow-y-auto text-xs flex-1 min-h-0">
          {sections.map((s) => (
            <div key={s.heading}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.heading}</div>
              {s.lines.length === 0 ? (
                <div className="text-foreground/70">—</div>
              ) : (
                <ul className="space-y-0.5">
                  {s.lines.slice(0, 5).map((l, i) => (
                    <li key={i} className="text-foreground truncate">{l}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
