import { Block, IdeaPayload, IdeaStatus } from "../block-types";
import { Lightbulb } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const STATUS_RING: Record<IdeaStatus, string> = {
  untested: "ring-muted-foreground/40",
  validated: "ring-emerald-500/60",
  invalidated: "ring-rose-500/60",
};

export function IdeaBlock({ block, onUpdate }: Props) {
  const { t } = useLanguage();
  const idea: IdeaPayload = block.idea ?? { hypothesis: "", validation_status: "untested", confidence: 3 };

  const update = (patch: Partial<IdeaPayload>) => onUpdate({ idea: { ...idea, ...patch } });

  return (
    <div className={`rounded-lg border border-border bg-card p-3 ring-2 ring-offset-2 ring-offset-background ${STATUS_RING[idea.validation_status]}`}>
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-medium uppercase tracking-wider">{t("onenote.block.idea")}</span>
      </div>
      <textarea
        value={idea.hypothesis}
        onChange={(e) => update({ hypothesis: e.target.value })}
        placeholder={t("onenote.idea.hypothesis")}
        rows={2}
        className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
      />
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <select
          value={idea.validation_status}
          onChange={(e) => update({ validation_status: e.target.value as IdeaStatus })}
          className="text-xs bg-muted/40 border border-border rounded px-1.5 py-0.5 text-foreground"
        >
          <option value="untested">{t("onenote.idea.status.untested")}</option>
          <option value="validated">{t("onenote.idea.status.validated")}</option>
          <option value="invalidated">{t("onenote.idea.status.invalidated")}</option>
        </select>
        <label className="text-xs text-muted-foreground flex items-center gap-1.5">
          {t("onenote.idea.confidence")}
          <input
            type="range"
            min={1}
            max={5}
            value={idea.confidence}
            onChange={(e) => update({ confidence: Number(e.target.value) as IdeaPayload["confidence"] })}
            className="w-20 accent-primary"
          />
          <span className="font-medium text-foreground">{idea.confidence}/5</span>
        </label>
      </div>
    </div>
  );
}
