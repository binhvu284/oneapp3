import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { useNoteTemplates, NoteTemplate } from "@/hooks/useNoteTemplates";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface DraftState {
  id?: string;
  name: string;
  description: string;
  content: string;
  is_system: boolean;
}

const EMPTY_DRAFT: DraftState = {
  name: "",
  description: "",
  content: '{"blocks":[{"id":"1","type":"heading","level":1,"content":"{{project_name}}"}]}',
  is_system: false,
};

export default function TemplatesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { templates, systemTemplates, userTemplates, isLoading } = useNoteTemplates();
  const [draft, setDraft] = useState<DraftState | null>(null);

  const canCreateSystem = useMemo(() => (user?.level ?? 99) <= 2, [user]);

  const startNew = () => setDraft({ ...EMPTY_DRAFT });

  const startEdit = (tmpl: NoteTemplate) => {
    setDraft({
      id: tmpl.id,
      name: tmpl.name,
      description: tmpl.description ?? "",
      content: tmpl.content ?? "",
      is_system: tmpl.is_system,
    });
  };

  const saveDraft = async () => {
    if (!user || !draft) return;
    if (!draft.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const payload = {
      name: draft.name.trim(),
      description: draft.description,
      content: draft.content,
      is_system: draft.is_system && canCreateSystem,
      user_id: draft.is_system && canCreateSystem ? null : user.id,
      note_type: "note",
    };
    const { error } = draft.id
      ? await supabase.from("note_templates").update(payload).eq("id", draft.id)
      : await supabase.from("note_templates").insert(payload);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["note_templates"] });
    setDraft(null);
  };

  const removeTemplate = async (id: string) => {
    const { error } = await supabase.from("note_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["note_templates"] });
  };

  const renderList = (items: NoteTemplate[], heading: string) => (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground px-1">{heading}</h2>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 px-1">—</p>
      ) : (
        <ul className="space-y-1">
          {items.map(tpl => (
            <li
              key={tpl.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-card hover:bg-muted/30"
            >
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{tpl.name}</div>
                {tpl.description && (
                  <div className="text-xs text-muted-foreground truncate">{tpl.description}</div>
                )}
              </div>
              {(!tpl.is_system || canCreateSystem) && (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(tpl)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                    aria-label={t("onenote.templates.edit")}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTemplate(tpl.id)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                    aria-label={t("onenote.templates.delete")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{t("onenote.templates.title")}</h1>
        <Button size="sm" onClick={startNew}>
          <Plus className="w-3.5 h-3.5 mr-1" /> {t("onenote.templates.create")}
        </Button>
      </header>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">…</p>
      ) : (
        <>
          {renderList(systemTemplates, t("onenote.templates.system"))}
          {renderList(userTemplates, t("onenote.templates.personal"))}
        </>
      )}

      {draft && (
        <div className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Template name"
          />
          <Input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Description"
          />
          <Textarea
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            rows={10}
            className="font-mono text-xs"
            placeholder='{"blocks":[…]}'
          />
          <p className="text-[10px] text-muted-foreground">{t("onenote.templates.tokenHint")}</p>
          {canCreateSystem && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.is_system}
                onChange={(e) => setDraft({ ...draft, is_system: e.target.checked })}
              />
              System template (visible to all users)
            </label>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveDraft}>Save</Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground/70 pt-3 border-t border-border">
        {templates.length} templates total. Apply via the New Note menu.
      </p>
    </div>
  );
}
