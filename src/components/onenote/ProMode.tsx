import { useState, useEffect, useCallback } from "react";
import { Plus, FolderPlus, Search, StickyNote, ChevronRight, ChevronDown, Folder, FolderOpen, MoreHorizontal, Pencil, Trash2, FileText, CheckSquare, Pin, PanelLeftClose, PanelLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useNotes, Note } from "@/hooks/useNotes";
import { useNoteTags } from "@/hooks/useNoteTags";
import { useNoteFolders, NoteFolder } from "@/hooks/useNoteFolders";
import { BlockEditor } from "./pro/BlockEditor";
import { TaskView } from "./pro/TaskView";
import { CreateNoteMenu } from "./pro/CreateNoteMenu";
import { NoteActionsMenu } from "./pro/NoteActionsMenu";
import { TagBadge } from "./TagBadge";
import { TagManager } from "./TagManager";
import { NoteColorPicker } from "./NoteColorPicker";
import { BacklinksPanel } from "./BacklinksPanel";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { parseContent } from "./pro/block-types";
import { extractLinkTitlesFromContent } from "@/lib/blocks/extract-links";
import { syncNoteLinks } from "@/hooks/useNoteLinks";
import { FF_NOTE_LINKS, FF_NOTE_AGING } from "@/lib/feature-flags";

export function ProMode() {
  const { notes, isLoading, createNote, updateNote, deleteNote, togglePin, toggleArchive, refetch } = useNotes();
  const { tags, createTag, setNoteTags } = useNoteTags();
  const { folders, isLoading: foldersLoading, createFolder, updateFolder, deleteFolder, getFolderTree } = useNoteFolders();
  const isMobile = useIsMobile();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [noteTagsMap, setNoteTagsMap] = useState<Record<string, string[]>>({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Batch-fetch tags
  useEffect(() => {
    const fetch = async () => {
      if (notes.length === 0) { setNoteTagsMap({}); return; }
      const noteIds = notes.map(n => n.id);
      const { data } = await supabase.from("note_tag_links").select("note_id, tag_id").in("note_id", noteIds);
      const map: Record<string, string[]> = {};
      noteIds.forEach(id => { map[id] = []; });
      (data || []).forEach((l: any) => {
        if (map[l.note_id]) map[l.note_id].push(l.tag_id);
        else map[l.note_id] = [l.tag_id];
      });
      setNoteTagsMap(map);
    };
    fetch();
  }, [notes]);

  const handleToggleTag = async (tagId: string) => {
    if (!selectedNote) return;
    const current = noteTagsMap[selectedNote.id] || [];
    const updated = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId];
    await setNoteTags(selectedNote.id, updated);
    setNoteTagsMap(prev => ({ ...prev, [selectedNote.id]: updated }));
  };

  const filteredNotes = notes.filter(n => {
    if (selectedFolderId === "__unfiled") return !n.parent_id && !(n as any).folder_id;
    if (selectedFolderId) return (n as any).folder_id === selectedFolderId;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateNote = async () => {
    const noteData: any = { title: "", note_type: "note" };
    if (selectedFolderId && selectedFolderId !== "__unfiled") noteData.folder_id = selectedFolderId;
    const note = await createNote(noteData);
    if (note) setSelectedNote(note);
  };

  const handleCreateFromTemplate = async (template: any) => {
    const noteData: any = {
      title: template.name,
      content: template.content,
      note_type: template.note_type || "note",
    };
    if (selectedFolderId && selectedFolderId !== "__unfiled") noteData.folder_id = selectedFolderId;
    const note = await createNote(noteData);
    if (note) setSelectedNote(note);
  };

  const handleCreateTask = async () => {
    const noteData: any = { title: "", note_type: "todo" };
    if (selectedFolderId && selectedFolderId !== "__unfiled") noteData.folder_id = selectedFolderId;
    const note = await createNote(noteData);
    if (note) setSelectedNote(note);
  };

  const handleDuplicate = async (note: Note) => {
    const dup = await createNote({
      title: (note.title || "Untitled") + " (Copy)",
      content: note.content,
      note_type: note.note_type,
      color: note.color,
    });
    if (dup) setSelectedNote(dup);
  };

  const handleMoveToFolder = async (noteId: string, folderId: string | null) => {
    await updateNote(noteId, { folder_id: folderId } as any);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const handleRenameFolder = async (id: string) => {
    if (!editingFolderName.trim()) { setEditingFolderId(null); return; }
    await updateFolder(id, { name: editingFolderName.trim() });
    setEditingFolderId(null);
  };

  const handleSaveContent = useCallback(async (content: string) => {
    if (!selectedNote) return;
    setSaveStatus("saving");
    await updateNote(selectedNote.id, { content });
    if (FF_NOTE_LINKS) {
      try {
        const titles = extractLinkTitlesFromContent(parseContent(content));
        if (titles.length > 0) {
          const { data } = await supabase
            .from("notes")
            .select("id, title")
            .eq("user_id", selectedNote.user_id)
            .in("title", titles);
          const ids = (data ?? []).map((r: { id: string }) => r.id);
          await syncNoteLinks(selectedNote.id, ids);
        } else {
          await syncNoteLinks(selectedNote.id, []);
        }
      } catch (e) {
        console.error("syncNoteLinks failed", e);
      }
    }
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1500);
  }, [selectedNote, updateNote]);

  const handleTitleChange = useCallback(async (title: string) => {
    if (!selectedNote) return;
    setSaveStatus("saving");
    await updateNote(selectedNote.id, { title });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1500);
  }, [selectedNote, updateNote]);

  // Keep selectedNote in sync
  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated) setSelectedNote(updated);
    }
  }, [notes]);

  const { rootFolders, getChildren } = getFolderTree();

  const renderFolderItem = (folder: NoteFolder, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const children = getChildren(folder.id);
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer group transition-colors text-xs ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
            }`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onClick={() => { setSelectedFolderId(folder.id); if (children.length) toggleFolder(folder.id); }}
        >
          {children.length > 0 ? (
            <button onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }} className="shrink-0">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : <span className="w-3" />}
          {isExpanded ? <FolderOpen className="w-3 h-3 shrink-0" /> : <Folder className="w-3 h-3 shrink-0" />}
          {isEditing ? (
            <input
              value={editingFolderName}
              onChange={e => setEditingFolderName(e.target.value)}
              onBlur={() => handleRenameFolder(folder.id)}
              onKeyDown={e => e.key === "Enter" && handleRenameFolder(folder.id)}
              className="flex-1 text-xs bg-transparent border-none outline-none"
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate">{folder.name}</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all shrink-0">
                <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-popover border z-50">
              <DropdownMenuItem onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}>
                <Pencil className="w-3 h-3 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteFolder(folder.id)} className="text-destructive">
                <Trash2 className="w-3 h-3 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExpanded && children.map(child => renderFolderItem(child, depth + 1))}
      </div>
    );
  };

  const selectedTags = selectedNote ? tags.filter(t => (noteTagsMap[selectedNote.id] || []).includes(t.id)) : [];

  const sidebar = (
    <div className="flex flex-col h-full bg-card/50">
      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search notes..." className="h-7 text-xs pl-7" />
        </div>
      </div>

      {/* Folders */}
      <div className="px-2 py-1.5 border-b border-border">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Folders</span>
          <button onClick={() => setShowNewFolder(!showNewFolder)} className="p-0.5 rounded hover:bg-muted transition-colors">
            <FolderPlus className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        {showNewFolder && (
          <div className="flex gap-1 mb-1">
            <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreateFolder()} placeholder="Folder name..." className="h-6 text-xs" autoFocus />
            <Button size="sm" className="h-6 px-2" onClick={handleCreateFolder}><Plus className="w-3 h-3" /></Button>
          </div>
        )}
        <div className="space-y-0">
          <div onClick={() => setSelectedFolderId(null)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer text-xs transition-colors ${selectedFolderId === null ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
            <StickyNote className="w-3 h-3" /> All Notes
          </div>
          <div onClick={() => setSelectedFolderId("__unfiled")} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer text-xs transition-colors ${selectedFolderId === "__unfiled" ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}>
            <FileText className="w-3 h-3" /> Unfiled
          </div>
          {foldersLoading ? <Skeleton className="h-5 w-full rounded" /> : rootFolders.map(f => renderFolderItem(f))}
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Notes ({filteredNotes.length})</span>
          <CreateNoteMenu onCreateNote={handleCreateNote} onCreateTask={handleCreateTask} onCreateFromTemplate={handleCreateFromTemplate} />
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 pb-2 space-y-0">
            {isLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)
            ) : filteredNotes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No notes</p>
            ) : (
              filteredNotes.map(note => {
                const noteTags = tags.filter(t => (noteTagsMap[note.id] || []).includes(t.id));
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors group ${selectedNote?.id === note.id
                        ? "bg-primary/10 border-l-2 border-l-primary border border-primary/20"
                        : "hover:bg-muted/50 border-l-2 border-l-transparent border border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {note.note_type === "todo" ? <CheckSquare className="w-3 h-3 text-muted-foreground shrink-0" /> : <FileText className="w-3 h-3 text-muted-foreground shrink-0" />}
                      <span className="text-xs font-medium truncate flex-1">{note.title || "Untitled"}</span>
                      {FF_NOTE_AGING && (Date.now() - new Date(note.updated_at).getTime() > 30 * 86400000) && (
                        <span
                          className="text-[9px] px-1 py-0 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0"
                          title="Note hasn't changed in 30+ days"
                        >
                          Revisit?
                        </span>
                      )}
                      {note.is_pinned && <Pin className="w-2.5 h-2.5 text-primary shrink-0" />}
                      <NoteActionsMenu
                        note={note}
                        folders={folders}
                        onPin={() => togglePin(note.id)}
                        onArchive={() => toggleArchive(note.id)}
                        onDuplicate={() => handleDuplicate(note)}
                        onMoveToFolder={(fid) => handleMoveToFolder(note.id, fid)}
                        onChangeColor={(c) => updateNote(note.id, { color: c })}
                        onExport={() => { }}
                        onDelete={() => { if (selectedNote?.id === note.id) setSelectedNote(null); deleteNote(note.id); }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-[18px]">
                      {format(new Date(note.updated_at), "MMM d")}
                    </span>
                    {noteTags.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 ml-[18px]">
                        {noteTags.slice(0, 2).map(t => <TagBadge key={t.id} name={t.name} color={t.color} />)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        {FF_NOTE_LINKS && (
          <div className="border-t border-border px-1 py-1.5 shrink-0">
            <BacklinksPanel
              noteId={selectedNote?.id ?? null}
              onSelect={(id) => {
                const n = notes.find(x => x.id === id);
                if (n) setSelectedNote(n);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const editor = selectedNote ? (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button onClick={() => setSelectedNote(null)} className="p-1 rounded hover:bg-muted"><ChevronRight className="w-4 h-4 rotate-180" /></button>
          )}
          {saveStatus === "saving" && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}
          {saveStatus === "saved" && <span className="text-[10px] text-primary">Saved</span>}
        </div>
        <span className="text-[10px] text-muted-foreground">{format(new Date(selectedNote.updated_at), "MMM d, HH:mm")}</span>
      </div>

      {/* Content - TaskView or BlockEditor */}
      {selectedNote.note_type === "todo" ? (
        <TaskView
          noteId={selectedNote.id}
          title={selectedNote.title}
          onTitleChange={handleTitleChange}
        />
      ) : (
        <>
          {/* Title */}
          <div className="px-4 pt-3 pb-1 shrink-0">
            <input
              value={selectedNote.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="w-full text-xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30"
            />
          </div>

          {/* Block editor */}
          <div className="flex-1 min-h-0 px-3">
            <BlockEditor content={selectedNote.content} onSave={handleSaveContent} />
          </div>

          {/* Compact footer toolbar */}
          <div className="px-4 py-1 border-t border-border flex items-center gap-2 shrink-0 flex-wrap">
            {selectedTags.map(tag => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} size="md" onRemove={() => handleToggleTag(tag.id)} />
            ))}
            <TagManager allTags={tags} selectedTagIds={noteTagsMap[selectedNote.id] || []} onToggleTag={handleToggleTag} onCreateTag={createTag} />
            <div className="ml-auto">
              <NoteColorPicker value={selectedNote.color} onChange={c => updateNote(selectedNote.id, { color: c })} />
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
      <StickyNote className="w-10 h-10 text-muted-foreground/15" />
      <p className="text-sm text-muted-foreground">Select or create a note</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleCreateNote}>
          <FileText className="w-3.5 h-3.5" /> Create Note
        </Button>
        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleCreateTask}>
          <CheckSquare className="w-3.5 h-3.5" /> Create Task
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    if (selectedNote) return <div className="flex-1 min-h-0">{editor}</div>;
    return <div className="flex-1 min-h-0">{sidebar}</div>;
  }

  return (
    <div className="flex-1 min-h-0 border border-border rounded-lg overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal">
        {!sidebarCollapsed && (
          <>
            <ResizablePanel defaultSize={25} minSize={18} maxSize={35}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-end px-2 py-0.5 border-b border-border shrink-0">
                  <button onClick={() => setSidebarCollapsed(true)} className="p-0.5 rounded hover:bg-muted transition-colors">
                    <PanelLeftClose className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex-1 min-h-0">{sidebar}</div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
        <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
          <div className="h-full flex flex-col">
            {sidebarCollapsed && (
              <div className="px-2 py-0.5 border-b border-border shrink-0">
                <button onClick={() => setSidebarCollapsed(false)} className="p-0.5 rounded hover:bg-muted transition-colors">
                  <PanelLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
            <div className="flex-1 min-h-0">{editor}</div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
