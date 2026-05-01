import { Link2 } from "lucide-react";
import { useBacklinks } from "@/hooks/useNoteLinks";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  noteId: string | null;
  onSelect?: (noteId: string) => void;
}

export function BacklinksPanel({ noteId, onSelect }: Props) {
  const { t } = useLanguage();
  const { data: backlinks = [], isLoading } = useBacklinks(noteId);

  if (!noteId) return null;

  return (
    <div className="border-t border-border pt-2 mt-2">
      <div className="flex items-center gap-1.5 px-2 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Link2 className="w-3 h-3" />
        {t("onenote.backlinks.title")}
        {backlinks.length > 0 && <span className="ml-auto">{backlinks.length}</span>}
      </div>
      {isLoading ? (
        <div className="px-2 py-1 text-xs text-muted-foreground/60">…</div>
      ) : backlinks.length === 0 ? (
        <div className="px-2 py-1 text-xs text-muted-foreground/60">{t("onenote.backlinks.empty")}</div>
      ) : (
        <ul className="space-y-0.5">
          {backlinks.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => b.source && onSelect?.(b.source.id)}
                className="w-full text-left text-xs px-2 py-1 rounded hover:bg-muted/50 text-foreground truncate"
              >
                {b.source?.title || "Untitled"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
