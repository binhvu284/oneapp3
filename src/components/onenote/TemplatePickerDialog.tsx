import { FileText, BookOpen, Target, Calendar, Bug, Users } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteTemplates } from "@/hooks/useNoteTemplates";
import type { NoteTemplate } from "@/hooks/useNoteTemplates";

const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Bug: <Bug className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: NoteTemplate) => void;
}

export function TemplatePickerDialog({ open, onOpenChange, onSelectTemplate }: TemplatePickerDialogProps) {
  const { systemTemplates, userTemplates, isLoading } = useNoteTemplates();

  const handleSelect = (template: NoteTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New from Template</DialogTitle>
          <DialogDescription>Choose a template to start your note</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : (
            <>
              {systemTemplates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">System Templates</p>
                  {systemTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {ICON_MAP[template.icon_name] ?? <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {userTemplates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">My Templates</p>
                  {userTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {systemTemplates.length === 0 && userTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No templates available</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
