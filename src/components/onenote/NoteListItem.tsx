import { Pin, Archive, Trash2, CheckSquare, FileText } from "lucide-react";
import { Note } from "@/hooks/useNotes";
import { NoteTag } from "@/hooks/useNoteTags";
import { TagBadge } from "./TagBadge";

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  tags: NoteTag[];
  noteTagIds: string[];
  todoProgress?: { done: number; total: number };
  onClick: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function NoteListItem({ note, isSelected, tags, noteTagIds, todoProgress, onClick, onPin, onArchive, onDelete }: NoteListItemProps) {
  const noteTags = tags.filter(t => noteTagIds.includes(t.id));

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
        isSelected
          ? "bg-primary/5 border-primary/20"
          : "border-transparent hover:bg-muted/50"
      }`}
    >
      {/* Color indicator */}
      {note.color && (
        <div className="w-1 h-full min-h-[40px] rounded-full shrink-0 mt-0.5" style={{ backgroundColor: note.color }} />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-1.5">
          {note.note_type === "todo" ? (
            <CheckSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <h4 className="text-sm font-medium truncate">
            {note.title || "Untitled"}
          </h4>
          {note.is_pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
        </div>

        {/* Preview */}
        {note.note_type === "todo" && todoProgress ? (
          <p className="text-xs text-muted-foreground">
            {todoProgress.done}/{todoProgress.total} completed
          </p>
        ) : note.content ? (
          <p className="text-xs text-muted-foreground truncate">{note.content}</p>
        ) : null}

        {/* Tags */}
        {noteTags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {noteTags.map(tag => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1 rounded hover:bg-muted transition-colors" title={note.is_pinned ? "Unpin" : "Pin"}>
          <Pin className={`w-3 h-3 ${note.is_pinned ? "text-primary" : "text-muted-foreground"}`} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onArchive(); }} className="p-1 rounded hover:bg-muted transition-colors" title={note.is_archived ? "Unarchive" : "Archive"}>
          <Archive className="w-3 h-3 text-muted-foreground" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-muted transition-colors" title="Delete">
          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </div>
  );
}
