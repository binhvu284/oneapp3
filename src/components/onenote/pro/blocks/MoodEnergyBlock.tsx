import { Block, MoodEnergyPayload } from "../block-types";
import { HeartPulse } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface Props {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

const MOODS = ["😴", "😕", "🙂", "😀", "🚀"];

export function MoodEnergyBlock({ block, onUpdate }: Props) {
  const { t } = useLanguage();
  const mood: MoodEnergyPayload = block.mood ?? {
    energy: 3,
    mood: "🙂",
    note: "",
    recorded_at: new Date().toISOString(),
  };

  const update = (patch: Partial<MoodEnergyPayload>) => onUpdate({ mood: { ...mood, ...patch } });

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <HeartPulse className="w-4 h-4 text-rose-400" />
      <div className="flex items-center gap-1">
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => update({ mood: m })}
            className={`text-lg transition-transform hover:scale-110 ${mood.mood === m ? "scale-110" : "opacity-60"}`}
            aria-label={`mood ${m}`}
          >
            {m}
          </button>
        ))}
      </div>
      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
        {t("onenote.mood.energy")}
        <input
          type="range"
          min={1}
          max={5}
          value={mood.energy}
          onChange={(e) => update({ energy: Number(e.target.value) as MoodEnergyPayload["energy"] })}
          className="w-20 accent-primary"
        />
        <span className="font-medium text-foreground">{mood.energy}/5</span>
      </label>
      <input
        value={mood.note ?? ""}
        onChange={(e) => update({ note: e.target.value })}
        placeholder={t("onenote.mood.note")}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
