import { useState, useEffect } from "react";

interface ClockWidgetProps {
  config?: Record<string, any>;
  onConfigChange?: (c: Record<string, any>) => void;
}

export default function ClockWidget({ config }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());
  const mode = config?.mode ?? "digital"; // "digital" | "analog"
  const timezone = config?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const localeTime = new Date(time.toLocaleString("en-US", { timeZone: timezone }));
  const hours = localeTime.getHours();
  const minutes = localeTime.getMinutes();
  const seconds = localeTime.getSeconds();

  if (mode === "analog") {
    const hDeg = (hours % 12) * 30 + minutes * 0.5;
    const mDeg = minutes * 6;
    const sDeg = seconds * 6;

    return (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <svg viewBox="0 0 100 100" className="w-20 h-20">
          <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = 50 + 38 * Math.cos(angle);
            const y1 = 50 + 38 * Math.sin(angle);
            const x2 = 50 + 42 * Math.cos(angle);
            const y2 = 50 + 42 * Math.sin(angle);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" />;
          })}
          {/* Hour hand */}
          <line
            x1="50" y1="50"
            x2={50 + 22 * Math.cos((hDeg - 90) * (Math.PI / 180))}
            y2={50 + 22 * Math.sin((hDeg - 90) * (Math.PI / 180))}
            stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1="50" y1="50"
            x2={50 + 30 * Math.cos((mDeg - 90) * (Math.PI / 180))}
            y2={50 + 30 * Math.sin((mDeg - 90) * (Math.PI / 180))}
            stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round"
          />
          {/* Second hand */}
          <line
            x1="50" y1="50"
            x2={50 + 34 * Math.cos((sDeg - 90) * (Math.PI / 180))}
            y2={50 + 34 * Math.sin((sDeg - 90) * (Math.PI / 180))}
            stroke="hsl(var(--primary))" strokeWidth="1" strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="2" fill="hsl(var(--primary))" />
        </svg>
        <p className="text-[10px] text-muted-foreground truncate max-w-full">
          {timezone.split("/").pop()?.replace(/_/g, " ")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-1">
      <div className="text-3xl font-bold text-foreground tracking-wider font-mono">
        {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}
        <span className="text-lg text-primary ml-1 animate-pulse">{seconds.toString().padStart(2, "0")}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">
        {localeTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
      </p>
      {timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone && (
        <p className="text-[9px] text-muted-foreground/60 truncate max-w-full">
          {timezone.split("/").pop()?.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
}
