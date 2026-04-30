import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface PomodoroWidgetProps {
  config?: Record<string, any>;
  onConfigChange?: (c: Record<string, any>) => void;
}

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroWidget({ config, onConfigChange }: PomodoroWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [sessions, setSessions] = useState(config?.sessions ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = isFocus ? FOCUS_TIME : BREAK_TIME;
  const progress = 1 - timeLeft / totalTime;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFocus(true);
    setTimeLeft(FOCUS_TIME);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch mode
          if (isFocus) {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            onConfigChange?.({ sessions: newSessions });
            setIsFocus(false);
            return BREAK_TIME;
          } else {
            setIsFocus(true);
            return FOCUS_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isFocus, sessions, onConfigChange]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      {/* Progress ring */}
      <div className="relative">
        <svg width="88" height="88" className="-rotate-90">
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="4"
          />
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={isFocus ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold font-mono text-foreground">{mins}:{secs}</span>
          <span className="text-[9px] text-muted-foreground">{isFocus ? "Focus" : "Break"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsRunning((p) => !p)}
          className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={reset}
          className="p-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-muted-foreground ml-1">
          {sessions} session{sessions !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
