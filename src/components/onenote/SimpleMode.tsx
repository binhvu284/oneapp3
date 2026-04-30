import { useState, useEffect } from "react";
import { Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotes, Note } from "@/hooks/useNotes";
import { useNoteTags } from "@/hooks/useNoteTags";
import { NoteListItem } from "./NoteListItem";
import { NoteEditorPanel } from "./NoteEditorPanel";
import { NoteFilters } from "./NoteFilters";
import { NoteEditorInline } from "./NoteEditorInline";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

export function SimpleMode() {
  const { notes, isLoading, filter, setFilter, sort, setSort, tagFilter, setTagFilter, createNote, updateNote, deleteNote, togglePin, toggleArchive } = useNotes();
  const { tags, createTag, getNoteTags, setNoteTags } = useNoteTags();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [noteTagsMap, setNoteTagsMap] = useState<Record<string, string[]>>({});
  const [todoProgressMap, setTodoProgressMap] = useState<Record<string, { done: number; total: number }>>({});
  const isMobile = useIsMobile();

  // Batch-fetch tags for all visible notes
  useEffect(() => {
    const fetchAllNoteTags = async () => {
      if (notes.length === 0) { setNoteTagsMap({}); return; }
      const noteIds = notes.map(n => n.id);
      const { data } = await supabase
        .from("note_tag_links")
        .select("note_id, tag_id")
        .in("note_id", noteIds);
      const map: Record<string, string[]> = {};
      noteIds.forEach(id => { map[id] = []; });
      (data || []).forEach((l: any) => {
        if (map[l.note_id]) map[l.note_id].push(l.tag_id);
        else map[l.note_id] = [l.tag_id];
      });
      setNoteTagsMap(map);
    };
    fetchAllNoteTags();
  }, [notes]);

  // Batch-fetch todo progress
  useEffect(() => {
    const fetchProgress = async () => {
      const todoNotes = notes.filter(n => n.note_type === "todo");
      if (todoNotes.length === 0) { setTodoProgressMap({}); return; }
      const noteIds = todoNotes.map(n => n.id);
      const { data } = await supabase
        .from("note_items")
        .select("note_id, is_completed")
        .in("note_id", noteIds);
      const map: Record<string, { done: number; total: number }> = {};
      noteIds.forEach(id => { map[id] = { done: 0, total: 0 }; });
      (data || []).forEach((i: any) => {
        if (map[i.note_id]) {
          map[i.note_id].total++;
          if (i.is_completed) map[i.note_id].done++;
        }
      });
      setTodoProgressMap(map);
    };
    fetchProgress();
  }, [notes]);

  const handleCreateNote = async () => {
    const note = await createNote({ title: "", note_type: "note" });
    if (note) {
      setSelectedNote(note);
      setEditorOpen(true);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditorOpen(true);
  };

  const handleToggleTag = async (tagId: string) => {
    if (!selectedNote) return;
    const current = noteTagsMap[selectedNote.id] || [];
    const updated = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId];
    await setNoteTags(selectedNote.id, updated);
    setNoteTagsMap(prev => ({ ...prev, [selectedNote.id]: updated }));
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedNote(null);
  };

  // Keep selectedNote in sync with notes array
  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated) setSelectedNote(updated);
    }
  }, [notes]);

  const noteList = (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <NoteFilters
          filter={filter} onFilterChange={setFilter}
          sort={sort} onSortChange={setSort}
          tags={tags} tagFilter={tagFilter} onTagFilterChange={setTagFilter}
        />
        <Button size="sm" onClick={handleCreateNote} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> New
        </Button>
      </div>

      {/* Note list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <StickyNote className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No notes yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Click "+ New" to create your first note</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 pr-1">
            {notes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={selectedNote?.id === note.id}
                tags={tags}
                noteTagIds={noteTagsMap[note.id] || []}
                todoProgress={todoProgressMap[note.id]}
                onClick={() => handleSelectNote(note)}
                onPin={() => togglePin(note.id)}
                onArchive={() => toggleArchive(note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );

  // Desktop: split layout; Mobile: sheet overlay
  if (isMobile) {
    return (
      <div className="space-y-2">
        {noteList}
        <NoteEditorPanel
          note={selectedNote}
          open={editorOpen}
          onClose={handleCloseEditor}
          onUpdate={updateNote}
          allTags={tags}
          noteTagIds={selectedNote ? (noteTagsMap[selectedNote.id] || []) : []}
          onToggleTag={handleToggleTag}
          onCreateTag={createTag}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left: Note list */}
      <div className={`shrink-0 transition-all duration-300 ${editorOpen ? "w-[38%]" : "w-full"}`}>
        {noteList}
      </div>

      {/* Right: Inline editor */}
      {editorOpen && selectedNote && (
        <div className="flex-1 min-w-0 border border-border rounded-lg bg-card overflow-hidden animate-fade-in-scale">
          <NoteEditorInline
            note={selectedNote}
            onClose={handleCloseEditor}
            onUpdate={updateNote}
            allTags={tags}
            noteTagIds={noteTagsMap[selectedNote.id] || []}
            onToggleTag={handleToggleTag}
            onCreateTag={createTag}
          />
        </div>
      )}
    </div>
  );
}
