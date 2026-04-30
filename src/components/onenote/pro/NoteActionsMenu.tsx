import { useState } from "react";
import { MoreHorizontal, Pin, Archive, Copy, FolderInput, Palette, Download, Share2, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Note } from "@/hooks/useNotes";
import { NoteFolder } from "@/hooks/useNoteFolders";
import { ShareNoteDialog } from "@/components/onenote/ShareNoteDialog";

const NOTE_COLORS = [
  { name: "None", value: null },
  { name: "Yellow", value: "#fbbf24" },
  { name: "Green", value: "#34d399" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Purple", value: "#a78bfa" },
  { name: "Pink", value: "#f472b6" },
  { name: "Orange", value: "#fb923c" },
  { name: "Red", value: "#f87171" },
];

interface Props {
  note: Note;
  folders: NoteFolder[];
  onPin: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  onChangeColor: (color: string | null) => void;
  onExport: () => void;
  onDelete: () => void;
}

function blocksToMarkdown(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (!parsed?.blocks) return content;
    return parsed.blocks.map((b: any) => {
      switch (b.type) {
        case "heading": return `${"#".repeat(b.level || 1)} ${b.content || ""}`;
        case "quote": return `> ${b.content || ""}`;
        case "code": return `\`\`\`${b.language || ""}\n${b.content || ""}\n\`\`\``;
        case "divider": return "---";
        case "checklist":
          return (b.items || []).map((i: any) => `- [${i.checked ? "x" : " "}] ${i.content || ""}`).join("\n");
        case "bullet-list": return (b.items || []).map((i: any) => `- ${i.content || ""}`).join("\n");
        case "numbered-list": return (b.items || []).map((i: any, idx: number) => `${idx + 1}. ${i.content || ""}`).join("\n");
        default: return b.content || "";
      }
    }).join("\n\n");
  } catch {
    return content || "";
  }
}

export function NoteActionsMenu({ note, folders, onPin, onArchive, onDuplicate, onMoveToFolder, onChangeColor, onExport, onDelete }: Props) {
  const [shareOpen, setShareOpen] = useState(false);

  const handleExport = () => {
    const md = `# ${note.title || "Untitled"}\n\n${blocksToMarkdown(note.content)}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onExport();
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all shrink-0">
          <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-popover border z-50" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={onPin}>
          <Pin className="w-3.5 h-3.5 mr-2" /> {note.is_pinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive}>
          <Archive className="w-3.5 h-3.5 mr-2" /> {note.is_archived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderInput className="w-3.5 h-3.5 mr-2" /> Move to Folder
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border z-50">
            <DropdownMenuItem onClick={() => onMoveToFolder(null)}>Unfiled</DropdownMenuItem>
            {folders.map((f) => (
              <DropdownMenuItem key={f.id} onClick={() => onMoveToFolder(f.id)}>{f.name}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="w-3.5 h-3.5 mr-2" /> Change Color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border z-50">
            <div className="flex gap-1.5 p-2">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onChangeColor(c.value)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    note.color === c.value ? "border-primary scale-110" : "border-transparent hover:scale-105"
                  } ${!c.value ? "bg-muted border-border" : ""}`}
                  style={c.value ? { backgroundColor: c.value } : undefined}
                  title={c.name}
                />
              ))}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExport}>
          <Download className="w-3.5 h-3.5 mr-2" /> Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5 mr-2" /> Share Link
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ShareNoteDialog
      open={shareOpen}
      onOpenChange={setShareOpen}
      noteId={note.id}
      noteTitle={note.title || "Untitled"}
    />
    </>
  );
}
