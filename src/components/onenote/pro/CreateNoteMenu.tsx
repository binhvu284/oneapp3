import { useState } from "react";
import { Plus, FileText, CheckSquare, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TemplatePickerDialog } from "@/components/onenote/TemplatePickerDialog";
import type { NoteTemplate } from "@/hooks/useNoteTemplates";

interface Props {
  onCreateNote: () => void;
  onCreateTask: () => void;
  onCreateFromTemplate: (template: NoteTemplate) => void;
}

export function CreateNoteMenu({ onCreateNote, onCreateTask, onCreateFromTemplate }: Props) {
  const [templateOpen, setTemplateOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-5 px-1">
            <Plus className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-popover border z-50">
          <DropdownMenuItem onClick={onCreateNote}>
            <FileText className="w-3.5 h-3.5 mr-2" /> New Note
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCreateTask}>
            <CheckSquare className="w-3.5 h-3.5 mr-2" /> New Task
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTemplateOpen(true)}>
            <LayoutTemplate className="w-3.5 h-3.5 mr-2" /> From Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TemplatePickerDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelectTemplate={onCreateFromTemplate}
      />
    </>
  );
}
