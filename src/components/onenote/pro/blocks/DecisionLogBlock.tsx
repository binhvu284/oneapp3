import { useState } from "react";
import { Block, DecisionLogPayload, DecisionOutcome, DECISION_LOCK_MS } from "../block-types";
import { Scale, Lock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const OUTCOME_TONE: Record<DecisionOutcome, string> = {
  pending: "bg-muted/40 text-muted-foreground",
  good: "bg-emerald-500/15 text-emerald-400",
  bad: "bg-rose-500/15 text-rose-400",
};

export function DecisionLogBlock({ block, onUpdate }: Props) {
  const { t } = useLanguage();
  const decision: DecisionLogPayload = block.decision ?? {
    decision: "",
    reasoning: "",
    decided_at: new Date().toISOString(),
    outcome: "pending",
  };

  const decidedAtMs = new Date(decision.decided_at).getTime();
  const isLocked = !decision.unlock_reason && Date.now() - decidedAtMs > DECISION_LOCK_MS;
  const [unlockDraft, setUnlockDraft] = useState("");

  const update = (patch: Partial<DecisionLogPayload>) => onUpdate({ decision: { ...decision, ...patch } });

  const lockedField = isLocked ? "pointer-events-none opacity-70 select-text" : "";

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Scale className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium uppercase tracking-wider">{t("onenote.block.decision")}</span>
          <span className="text-[10px]">{new Date(decision.decided_at).toLocaleString()}</span>
          {isLocked && <Lock className="w-3 h-3 text-amber-400" aria-label={t("onenote.decision.locked")} />}
        </div>
        <select
          value={decision.outcome}
          onChange={(e) => update({ outcome: e.target.value as DecisionOutcome })}
          className={`text-xs rounded px-1.5 py-0.5 border border-border ${OUTCOME_TONE[decision.outcome]}`}
        >
          <option value="pending">{t("onenote.decision.outcome.pending")}</option>
          <option value="good">{t("onenote.decision.outcome.good")}</option>
          <option value="bad">{t("onenote.decision.outcome.bad")}</option>
        </select>
      </div>
      <textarea
        value={decision.decision}
        onChange={(e) => update({ decision: e.target.value })}
        placeholder={t("onenote.decision.decision")}
        rows={2}
        className={`w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50 resize-none ${lockedField}`}
      />
      <textarea
        value={decision.reasoning}
        onChange={(e) => update({ reasoning: e.target.value })}
        placeholder={t("onenote.decision.reasoning")}
        rows={3}
        className={`w-full bg-transparent outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/40 resize-none ${lockedField}`}
      />
      {isLocked && (
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <input
            value={unlockDraft}
            onChange={(e) => setUnlockDraft(e.target.value)}
            placeholder={t("onenote.decision.unlockReason")}
            className="flex-1 bg-muted/40 border border-border rounded px-2 py-1 text-xs text-foreground"
          />
          <button
            type="button"
            onClick={() => unlockDraft.trim() && update({ unlock_reason: unlockDraft.trim() })}
            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
            disabled={!unlockDraft.trim()}
          >
            {t("onenote.decision.unlock")}
          </button>
        </div>
      )}
      {decision.unlock_reason && (
        <p className="text-[10px] italic text-muted-foreground">↪ {decision.unlock_reason}</p>
      )}
    </div>
  );
}
