import { useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useInlineAI, InlineAIAction } from "@/hooks/useInlineAI";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  position: { top: number; left: number };
  context: { above: string[]; current: string; below: string[] };
  onInsert: (text: string) => void;
  onClose: () => void;
}

export function InlineAIPanel({ position, context, onInsert, onClose }: Props) {
  const { t } = useLanguage();
  const { output, isStreaming, error, run, reset } = useInlineAI();

  useEffect(() => () => reset(), [reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const actions: { action: InlineAIAction; labelKey: string }[] = [
    { action: "continue", labelKey: "onenote.inlineAI.continue" },
    { action: "summarize", labelKey: "onenote.inlineAI.summarize" },
    { action: "ideas", labelKey: "onenote.inlineAI.ideas" },
    { action: "grammar", labelKey: "onenote.inlineAI.grammar" },
    { action: "translate_en", labelKey: "onenote.inlineAI.translateEN" },
    { action: "translate_vi", labelKey: "onenote.inlineAI.translateVI" },
  ];

  const showMissingKey = error?.toLowerCase().includes("claude api key");

  return (
    <div
      className="fixed z-[100] w-96 bg-popover border border-border rounded-lg shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">Inline AI</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t("onenote.inlineAI.cancel")}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 grid grid-cols-2 gap-1 border-b border-border">
        {actions.map((a) => (
          <button
            key={a.action}
            type="button"
            onClick={() => run({ action: a.action, ...context })}
            disabled={isStreaming}
            className="text-left text-xs px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground text-foreground disabled:opacity-50"
          >
            {t(a.labelKey)}
          </button>
        ))}
      </div>

      <div className="p-2 max-h-56 overflow-y-auto text-xs text-foreground whitespace-pre-wrap">
        {showMissingKey ? (
          <p className="text-amber-400">{t("onenote.inlineAI.missingKey")}</p>
        ) : error ? (
          <p className="text-rose-400">{error}</p>
        ) : output ? (
          output
        ) : (
          <p className="text-muted-foreground/60">Pick an action above…</p>
        )}
        {isStreaming && <span className="inline-block w-1.5 h-3 bg-foreground/60 animate-pulse ml-0.5" />}
      </div>

      <div className="flex items-center justify-end gap-2 px-2 py-1.5 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground px-2 py-1 hover:text-foreground"
        >
          {t("onenote.inlineAI.cancel")}
        </button>
        <button
          type="button"
          onClick={() => output && onInsert(output)}
          disabled={!output || isStreaming}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
        >
          {t("onenote.inlineAI.insert")}
        </button>
      </div>
    </div>
  );
}
