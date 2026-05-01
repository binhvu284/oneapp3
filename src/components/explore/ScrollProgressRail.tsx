import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  label: string;
}

const DEFAULT_CHAPTERS: Chapter[] = [
  { id: "hero", label: "Intro" },
  { id: "values", label: "Values" },
  { id: "ecosystem", label: "Ecosystem" },
  { id: "stats", label: "Stats" },
  { id: "features", label: "Features" },
];

interface ScrollProgressRailProps {
  chapters?: Chapter[];
}

export function ScrollProgressRail({ chapters = DEFAULT_CHAPTERS }: ScrollProgressRailProps) {
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? window.scrollY / docHeight : 0;
        setProgress(Math.max(0, Math.min(1, pct)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center pointer-events-none">
      <div className="relative h-72 w-px bg-white/10 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-cyan-400 to-cyan-600"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <ul className="absolute right-4 top-0 h-72 flex flex-col justify-between text-[10px] uppercase tracking-[0.2em] text-white/40">
        {chapters.map((chapter, i) => {
          const chapterProgress = i / Math.max(chapters.length - 1, 1);
          const active = progress >= chapterProgress - 0.05;
          return (
            <li
              key={chapter.id}
              className={cn(
                "transition-colors duration-300 whitespace-nowrap text-right",
                active ? "text-cyan-300" : "text-white/30"
              )}
            >
              {chapter.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
